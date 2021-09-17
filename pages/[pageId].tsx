import React, { useEffect } from 'react'
import { isDev, domain } from 'lib/config'
import { getSiteMaps } from 'lib/get-site-maps'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { NotionPage } from 'components'

import { emitEvent } from 'lib/analytics'
import { v4 as uid } from 'uuid'
import { PageProps } from 'lib/types'

export const getStaticProps = async (context) => {
  const rawPageId = context.params.pageId as string

  try {
    if (rawPageId === 'sitemap.xml') {
      return {
        redirect: {
          destination: `/api/${rawPageId}`
        }
      }
    }

    const props = await resolveNotionPage(domain, rawPageId)

    return { props, revalidate: 120 }
  } catch (err) {
    console.error('page error', domain, rawPageId, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export async function getStaticPaths() {
  if (isDev) {
    return {
      paths: [],
      fallback: true
    }
  }

  const siteMaps = await getSiteMaps()

  const ret = {
    paths: siteMaps.flatMap((siteMap) =>
      Object.keys(siteMap.canonicalPageMap).map((pageId) => ({
        params: {
          pageId
        }
      }))
    ),
    fallback: true
  }

  console.log(ret.paths)
  return ret
}

export default function NotionDomainDynamicPage(props: PageProps) {
  // use the Next.js Router to detect page routing _view _leave _exit

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
      console.log('RUN CLEANUP IN INDEX.js')
      emitEvent({ puid, pageId: props.pageId, eventName: 'page_leave' })
    }
  }, [])
  return <NotionPage {...props} />
}
