// PNR Search — docs/testing-plan.md → «PNR Search» (addresses 1–12 and live scenarios).
// Flow doc: projects/pnr-search/README.md. Check ids match the testing plan rows.

const ADDRESSES = [
  ['1 Empty', '', (t) => t.includes('How can I help') && !t.includes('Opening')],
  ['2 Ready', '?pnr=7JRWT4', (t) => !t.includes('Opening')],
  ['3 Loading', '?pnr=7JRWT4&state=loading', (t) => t.includes('Loading')],
  ['4 GDS Required', '?pnr=ABC123&state=result', (t) => t.includes('Amadeus Sabre Galileo')],
  ['5 Found · Default Office', '?pnr=7JRWT4&state=result', (t) => t.includes('Opening 7JRWT4 in A2K9 · Amadeus') && t.includes('Your default office for Amadeus')],
  ['5a Found · BBV14Q', '?pnr=BBV14Q&state=result', (t) => t.includes('Opening BBV14Q in 5GW5 · Sabre')],
  ['6 Found · Creation office', '?persona=agent-no-defaults&pnr=7JRWT4&state=result', (t) => t.includes('B3R7') && t.includes('Creation office')],
  ['7 Found · after GDS Required', '?pnr=ABC123&gds=Galileo&state=result', (t) => t.includes('Opening ABC123 in Q8L3 · Galileo')],
  ['8 Found · selected Office', '?pnr=7JRWT4&office=E6T8&state=result', (t) => t.includes('E6T8') && t.includes('Use this as my default office for Amadeus')],
  ['9 Not Found', '?pnr=XYZ789&gds=Sabre&state=result', (t) => t.includes('PNR XYZ789 not found in Sabre. Select another GDS or check the PNR.')],
  ['9a Not Found · two GDS', '?pnr=XYZ789&tried=Amadeus&gds=Sabre&state=result', (t) => t.includes('not found in Amadeus or Sabre')],
  ['9b Not Found · all GDS', '?pnr=XYZ789&tried=Amadeus,Sabre&gds=Galileo&state=result', (t) => t.includes('not found in any GDS. Check the PNR.')],
  ['9c Not Found · Office', '?pnr=7JRWT4&office=5GW5&state=result', (t) => t.includes('Choose another office or clear the office.')],
  ['10 Error · unavailable', '?pnr=ERR000&state=result', (t) => t.includes('Something went wrong. Please try again.')],
  ['11 Error · no access', '?pnr=K2M9QP&office=X4PD&state=result', (t) => t.includes('Office X4PD has no access to PNR K2M9QP. Choose another office.')],
  ['12 PNR Required', '?state=result', (t) => t.includes('Please provide the PNR.')],
]

export default async function pnrSearch({ page, go, path, text, check, shot }) {
  for (const [id, query, expected] of ADDRESSES) {
    await go(query)
    const main = await text('main')
    check(id, expected(main), main.slice(0, 100))
  }
  await go('?pnr=7JRWT4&state=result')
  await shot('found')

  // Live scenario B: new PNR → GDS Required → Galileo → Found.
  await go('')
  await page.getByRole('textbox', { name: 'PNR' }).fill('abc123')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(2000)
  await page.getByRole('button', { name: 'Galileo', exact: true }).click()
  await page.waitForTimeout(2000)
  check('Live scenario B (ABC123 → Galileo)', path() === '/?pnr=ABC123&gds=Galileo&state=result' && (await text('main')).includes('Q8L3'), path())

  // Empty search, then typing clears the message.
  await go('')
  await page.getByRole('button', { name: 'Search booking' }).click()
  await page.waitForTimeout(200)
  const required = (await text('main')).includes('Please provide the PNR.')
  await page.getByRole('textbox', { name: 'PNR' }).fill('7')
  await page.waitForTimeout(200)
  check('Live empty PNR → message, typing clears it', required && !(await text('main')).includes('Please provide the PNR.'))
}
