// User visits a landing page
// let isNewUser = localStorage.getItem('puid')
// Check: isNewUser && localStorage.setItem("puid", uuid)
// Funtion emitEvent(<eventName>, { <puid>, <pageId>, other markers (timestamp set by DB) }) - data object equals one row in DB table events
// Funktion emitEvent() posts to an API route - /api/handle-events

// Possible eventNames
// page_view, cta_click, page_leave

// emitEvent runs client side . within useEffect
// emitEvent posts to /api/events - where the DB call is handled server-side

import { v4 as uid } from 'uuid'
import { api } from './config'
import { EventData } from './types'

export const emitEvent = async (eventData: EventData): Promise<void> => {
  await fetch(api.handleEvents, {
    method: 'POST',
    body: JSON.stringify(eventData),
    headers: {
      'Content-type': 'application/json'
    }
  })
}

export const analytics = (hasConsent: boolean) => {
  if (typeof window !== 'undefined' && hasConsent) {
    let puid = localStorage.getItem('puid')
    const exitHandlerAttached = sessionStorage.getItem('on')

    if (!puid) {
      puid = uid()
      localStorage.setItem('puid', puid)
    }

    const pageId = window.history.state.as
    const isMobile = window.innerWidth <= 450
    const language = window.navigator.language
    const referrer = document.referrer || null

    if (!exitHandlerAttached) {
      sessionStorage.setItem('on', '1')
      const timeWhenListenerAttached = new Date().toISOString()

      window.addEventListener(
        'beforeunload',
        () =>
          emitEvent({
            puid,
            pageId,
            eventName: 'page_unload',
            language,
            isMobile,
            startTimestamp: timeWhenListenerAttached
          }),
        { once: true }
      )
    }

    emitEvent({
      puid,
      pageId,
      eventName: 'page_view',
      language,
      isMobile,
      referrer
    })
  }
}
