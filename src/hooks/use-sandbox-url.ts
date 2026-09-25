// SANDBOX-ONLY: reads the sandbox URL and re-renders on navigation.
import * as React from 'react'
import { buildSandboxUrl, parseSandboxUrl, type SandboxParams } from '@/lib/sandbox-url'

const NAVIGATE_EVENT = 'sandbox:navigate'

function href(params: Partial<SandboxParams>): string {
  return buildSandboxUrl(params) || window.location.pathname
}

/** Opens an address: the page remounts from the URL, as if the link was pasted. */
export function navigate(params: Partial<SandboxParams>) {
  window.history.pushState(null, '', href(params))
  window.dispatchEvent(new Event(NAVIGATE_EVENT))
}

/** Opens an address in place of the current one: Back skips the page that redirected. */
export function redirect(params: Partial<SandboxParams>) {
  window.history.replaceState(null, '', href(params))
  window.dispatchEvent(new Event(NAVIGATE_EVENT))
}

/** Records where the user is now, without remounting — so the URL is always shareable. */
export function replaceUrl(params: Partial<SandboxParams>) {
  window.history.replaceState(null, '', href(params))
}

/**
 * `navKey` changes on every navigate()/back/forward. Use it as a React key so
 * the page re-reads its initial state from the URL.
 */
export function useSandboxUrl(): { params: SandboxParams; navKey: number } {
  const read = () => parseSandboxUrl(window.location.search)
  const [state, setState] = React.useState(() => ({ params: read(), navKey: 0 }))

  // Layout effect: subscribed before any page's passive effect runs, so a page that
  // redirects on mount (Booking → PNR Search) is heard on the very first render.
  React.useLayoutEffect(() => {
    const onNav = () => setState((s) => ({ params: read(), navKey: s.navKey + 1 }))
    window.addEventListener('popstate', onNav)
    window.addEventListener(NAVIGATE_EVENT, onNav)
    return () => {
      window.removeEventListener('popstate', onNav)
      window.removeEventListener(NAVIGATE_EVENT, onNav)
    }
  }, [])

  return state
}
