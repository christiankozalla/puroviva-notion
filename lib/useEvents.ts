import { useEffect, useState } from 'react'
import { emitEvent } from 'lib/analytics'
import { v4 as uid } from 'uuid'

export const useEvents = () => {
  const [cookieConsent, setCookieConsent] = useState(false)

  useEffect(() => {
    if (cookieConsent) {
      let puid = localStorage.getItem('puid')
      if (!puid) {
        puid = uid()
        localStorage.setItem('puid', puid)
      }

      const pageId = window.history.state.as
      const isMobile = window.innerWidth <= 450 ? true : false
      const language = window.navigator.language

      emitEvent({ puid, pageId, eventName: 'page_view', language, isMobile })
      window.addEventListener(
        'beforeunload',
        (e) =>
          emitEvent({
            puid,
            pageId,
            eventName: 'page_exit',
            language,
            isMobile
          }),
        { once: true }
      )

      return () => {
        console.log('RUN CLEANUP IN INDEX.js')
        emitEvent({ puid, pageId, eventName: 'page_leave', language, isMobile })
      }
    }
  }, [cookieConsent])

  return { cookieConsent, setCookieConsent }
}
