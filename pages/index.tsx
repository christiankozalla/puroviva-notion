import React, { useEffect } from 'react'
import { domain } from 'lib/config'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { NotionPage } from 'components'

import { emitEvent } from 'lib/analytics'
import { v4 as uid } from 'uuid'
import { PageProps } from 'lib/types'

export const getStaticProps = async () => {
  try {
    const props = await resolveNotionPage(domain)

    return { props, revalidate: 120 }
  } catch (err) {
    console.error('page error', domain, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export default function NotionDomainPage(props: PageProps) {
  useEffect(() => {
    let puid = localStorage.getItem('puid')
    if (!puid) {
      puid = uid()
      localStorage.setItem('puid', puid)
    }
    emitEvent({ puid, pageId: props.pageId, eventName: 'page_view' })
    window.addEventListener(
      'beforeunload',
      (e) => emitEvent({ puid, pageId: props.pageId, eventName: 'page_exit' }),
      { once: true }
    )
    return () => {
      window.removeEventListener('beforeunload', (e) =>
        emitEvent({ puid, pageId: props.pageId, eventName: 'page_exit' })
      )
      console.log('RUN CLEANUP IN INDEX.js')
      emitEvent({ puid, pageId: props.pageId, eventName: 'page_leave' })
    }
  }, [])
  return <NotionPage {...props} />
}
