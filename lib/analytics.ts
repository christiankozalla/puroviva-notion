// User visits a landing page
// let isNewUser = localStorage.getItem('puid')
// Check: isNewUser && localStorage.setItem("puid", uuid)
// Funtion emitEvent(<eventName>, { <puid>, <pageId>, other markers (timestamp set by DB) }) - data object equals one row in DB table events
// Funktion emitEvent() posts to an API route - /api/handle-events

// Possible eventNames
// page_view, cta_click, page_leave

// emitEvent runs client side . within useEffect
// emitEvent posts to /api/events - where the DB call is handled server-side

import { api } from './config'
import { EventData } from './types'

export const emitEvent = async ({
  puid,
  eventName,
  pageId,
  ctaId = null
}: EventData): Promise<void> => {
  const response = await fetch(api.handleEvents, {
    method: 'POST',
    body: JSON.stringify({ puid, eventName, pageId, ctaId }),
    headers: {
      'Content-type': 'application/json'
    }
  })

  const data = await response.json()
  console.log('RESPONSE IN emitEvent', data)
}
