// Booking Overview — docs/testing-plan.md → «Booking и Overview» (1–7, Overview) and «Виджет Passengers».
// Flow docs: projects/booking-overview/README.md, overview-widget.md, passengers-widget.md.
// Check ids: «BO» + the numbered row of the testing plan, so a failure points at its row.

const OVERVIEW = '?page=booking-overview&pnr='

export default async function bookingOverview({ page, go, path, text, check, shot }) {
  // 1–2 Header and layout
  await go(`${OVERVIEW}BBV14Q`)
  const header = await text('header')
  check('BO2 Header', header === 'BBV14Q Sabre 3 passengers Created: 08/10/2025 13:44', header)
  const hb = await page.locator('header').first().boundingBox()
  check('BO2 Header 44px', hb.height === 44, hb.height)
  check('BO1 History has no Active item', (await page.locator('[aria-current="page"]').count()) === 0)
  await shot('bbv14q')

  // 4 Overview widget: counter and collapse
  const overview = page.getByRole('button', { name: /^Overview/ }).first()
  check('BO4 Overview expanded, counter 6', (await overview.getAttribute('aria-expanded')) === 'true' && (await overview.innerText()).includes('6'), await overview.innerText())
  const ob = await overview.boundingBox()
  check('BO4 widget 800px wide, centred in the area', Math.round(ob.width) === 800, ob.width)
  await overview.press('Enter')
  check('BO4 Enter collapses', (await overview.getAttribute('aria-expanded')) === 'false')
  await overview.click()
  check('BO4 click expands', (await overview.getAttribute('aria-expanded')) === 'true')

  for (const [pnr, count] of [['K2M9QP', '1'], ['DEL3T3', '1']]) {
    await go(`${OVERVIEW}${pnr}`)
    const t = await page.getByRole('button', { name: /^Overview/ }).first().innerText()
    check(`BO4 ${pnr} counter ${count}`, t.includes(count), t)
  }

  // 5 Unknown or missing PNR
  await go(`${OVERVIEW}XYZ789`)
  check('BO5 unknown PNR', (await text('main')).includes('No mock booking'), await text('main'))
  await go('?page=booking-overview')
  check('BO5 no PNR', (await text('main')).includes('No PNR in the address'), await text('main'))

  // Overview matrix
  await go(`${OVERVIEW}BBV14Q`)
  const matrix = await text('main')
  check('Overview BBV14Q: P1×S1 statuses', ['Inactive', 'Ticketed', 'Voided'].every((s) => matrix.includes(s)), matrix.slice(0, 200))
  check('Overview BBV14Q: No document', matrix.includes('No document'))
  check('Overview segment date without year', matrix.includes('14 Jun'))
  await go(`${OVERVIEW}PRC5TS`)
  const prc = await text('main')
  check('Overview PRC5TS: all Pricing statuses', ['Ticketed', 'Unknown', 'Reprice required', 'Itinerary changed', 'Inactive'].every((s) => prc.includes(s)), prc.slice(0, 200))
  await go(`${OVERVIEW}WIDE55`)
  const scrolls = await page.evaluate(() => [...document.querySelectorAll('*')].some((e) => e.scrollWidth > e.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(e).overflowX)))
  check('Overview WIDE55 scrolls horizontally', scrolls)
  await go(`${OVERVIEW}BBV14Q`)
  const bbvScrolls = await page.evaluate(() => [...document.querySelectorAll('*')].some((e) => e.scrollWidth > e.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(e).overflowX)))
  check('Overview BBV14Q (3 passengers) does not scroll', !bbvScrolls)

  // 6 Window width: no page scroll from 800px up
  for (const width of [1440, 1024, 800]) {
    await page.setViewportSize({ width, height: 800 })
    await go(`${OVERVIEW}BBV14Q`)
    check(`BO6 window ${width}: no page scroll`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  }
  await page.setViewportSize({ width: 1920, height: 1115 })

  // 7 Whole path: PNR Search → Found → Open booking → Booking Overview
  await go('')
  await page.getByRole('textbox', { name: 'PNR' }).fill('BBV14Q')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(2200)
  await page.getByRole('link', { name: /Open booking/ }).click()
  await page.waitForTimeout(500)
  check('BO7 Found → Open booking', path() === `/${OVERVIEW}BBV14Q`, path())

  // Passengers widget, PAX7QD
  await go(`${OVERVIEW}PAX7QD`)
  const cards = page.getByRole('button', { name: /^P[1-6] / })
  check('PAX widget: six cards, all closed', (await cards.count()) === 6 && (await cards.evaluateAll((els) => els.every((e) => e.getAttribute('aria-expanded') === 'false'))))
  const first = cards.first()
  check('PAX P1 closed row text', (await first.innerText()).replace(/\s+/g, ' ').includes('Kallio Anna Maria Ms'), await first.innerText())
  await first.click()
  await cards.nth(3).click()
  check('PAX cards open independently', (await first.getAttribute('aria-expanded')) === 'true' && (await cards.nth(3).getAttribute('aria-expanded')) === 'true')
  const mainText = await text('main')
  check('PAX P1 opened: data and Frequent flyer', ['12/04/1985', 'FEMALE', 'FINLAND', '4400123456 (AY)', '9810004455 (SK)'].every((s) => mainText.includes(s)), mainText.slice(-300))
  await first.press('Space')
  check('PAX Space closes card', (await first.getAttribute('aria-expanded')) === 'false')
  await shot('pax7qd')
  await first.getByText('P1', { exact: true }).hover()
  await page.waitForTimeout(700)
  check('PAX badge tooltip «Passenger 1»', (await page.getByRole('tooltip').count()) > 0 && (await page.getByRole('tooltip').first().innerText()).includes('Passenger 1'))
}
