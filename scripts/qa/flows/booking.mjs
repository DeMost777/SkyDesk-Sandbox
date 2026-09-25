// Booking — docs/testing-plan.md → «Booking» (B1–B13). Flow doc: projects/booking-overview/README.md.
// Check ids match the testing plan, so a failure points at its row.

export default async function booking({ page, go, path, text, check, shot }) {
  await go('?page=booking&pnr=BBV14Q')
  const header = await text('header')
  check('B1 Header', header === 'BBV14Q Sabre 3 passengers Created: 08/10/2025 13:44', header)
  const tab = page.getByRole('tab')
  check('B1 tab «Booking Overview» selected', (await tab.getAttribute('aria-selected')) === 'true' && (await tab.innerText()) === 'Booking Overview')
  check('B1 widget area empty', (await page.getByRole('tabpanel').innerText()).trim() === '')
  check('B1 BBV14Q Active in History', (await page.getByRole('button', { name: /^BBV14Q, Sabre/ }).getAttribute('aria-current')) === 'page')
  check('B1 only one Active item', (await page.locator('[aria-current="page"]').count()) === 1)
  const bg = await page.locator('main').evaluate((e) => getComputedStyle(e).backgroundColor)
  check('B1 widget area background secondary', bg === 'rgb(245, 245, 244)', bg)
  await shot('b1')

  await go('')
  await page.getByRole('button', { name: 'Booking', exact: true }).click()
  await page.waitForTimeout(400)
  check('B1 nav link «Booking»', path() === '/?page=booking&pnr=BBV14Q', path())

  const headers = [
    ['B2 1 passenger', '?page=booking&pnr=K2M9QP', 'K2M9QP Sabre 1 passenger Created: 14/09/2026 16:30'],
    ['B3 after GDS Required', '?page=booking&pnr=ABC123&gds=Galileo', 'ABC123 Galileo 1 passenger Created: 27/08/2026 11:05'],
    ['B9 selected Office', '?page=booking&pnr=7JRWT4&office=E6T8', '7JRWT4 Amadeus 2 passengers Created: 02/09/2026 09:15'],
    ['B9 Creation office', '?page=booking&persona=agent-no-defaults&pnr=BBV14Q', 'BBV14Q Sabre 3 passengers Created: 08/10/2025 13:44'],
  ]
  for (const [id, query, expected] of headers) {
    await go(query)
    const h = await text('header')
    check(id, h === expected, h)
  }

  // A PNR that does not open goes to PNR Search with the same address.
  const redirects = [
    ['B4 → Not Found', '?page=booking&pnr=XYZ789&gds=Sabre', '/?pnr=XYZ789&gds=Sabre&state=result', 'PNR XYZ789 not found in Sabre'],
    ['B5 → GDS Required', '?page=booking&pnr=ABC123', '/?pnr=ABC123&state=result', 'please select the GDS'],
    ['B6 → PNR Required', '?page=booking', '/?state=result', 'Please provide the PNR.'],
    ['B10 → Error', '?page=booking&pnr=ERR000', '/?pnr=ERR000&state=result', 'Something went wrong'],
    ['B10 → Not Found · Office', '?page=booking&pnr=7JRWT4&office=5GW5', '/?pnr=7JRWT4&office=5GW5&state=result', 'not found in 5GW5 · Sabre'],
    ['B10 → Office without access', '?page=booking&pnr=K2M9QP&office=X4PD', '/?pnr=K2M9QP&office=X4PD&state=result', 'Office X4PD has no access'],
  ]
  for (const [id, query, url, expected] of redirects) {
    await go(query)
    const main = await text('main')
    check(id, path() === url && main.includes(expected), `${path()} | ${main.slice(0, 90)}`)
  }

  await go('')
  await go('?page=booking&pnr=XYZ789&gds=Sabre')
  await page.goBack()
  await page.waitForTimeout(600)
  check('B7 Back skips Booking', path() === '/', path())

  await go('?page=booking&pnr=BBV14Q')
  const before = path()
  await page.getByRole('button', { name: 'Toggle sidebar' }).click()
  await page.getByRole('button', { name: 'Toggle panel' }).click()
  await page.getByRole('button', { name: /^K7Q2LM/ }).click()
  await page.getByRole('button', { name: 'New chat' }).click()
  await page.waitForTimeout(300)
  check('B8 Header buttons and sidebar clicks do nothing', path() === before && (await text('header')).startsWith('BBV14Q'), path())

  await go('')
  await page.getByRole('button', { name: 'Booking', exact: true }).click()
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: 'PNR Search', exact: true }).click()
  await page.waitForTimeout(300)
  await page.goBack()
  await page.waitForTimeout(400)
  const backOnBooking = (await page.locator('header').count()) === 1
  await page.goForward()
  await page.waitForTimeout(400)
  const forwardOnSearch = (await page.locator('header').count()) === 0
  check('B11 Back / Forward between PNR Search and Booking', backOnBooking && forwardOnSearch)

  await page.setViewportSize({ width: 1024, height: 700 })
  await go('?page=booking&pnr=BBV14Q')
  const hb = await page.locator('header').boundingBox()
  const pb = await page.getByRole('button', { name: 'Toggle panel' }).boundingBox()
  check('B12 window 1024: Header 44px, panel button visible', hb.height === 44 && pb.x + pb.width <= 1024, JSON.stringify({ hb, pb }))
  check('B12 window 1024: no page scroll', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight))
  await shot('b12-1024')
  await page.setViewportSize({ width: 1920, height: 1115 })

  // Until the team approves PNR Search, a found PNR stays on the Found stub (user decision, 2026-09-25).
  await go('')
  await page.getByRole('textbox', { name: 'PNR' }).fill('BBV14Q')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(2200)
  check('B13 search BBV14Q → Found stub, no jump to Booking', path() === '/?pnr=BBV14Q&state=result' && (await text('main')).includes('Opening BBV14Q in 5GW5 · Sabre'), path())
}
