import { isDev, domain } from 'lib/config'
import { getSiteMaps } from 'lib/get-site-maps'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { NotionPage } from 'components'

import { PageProps } from 'lib/types'
import { useEvents } from 'lib/useEvents'
import { useState } from 'react'

import { CookieBanner } from '@palmabit/react-cookie-law'
import { bannerStyles } from '../styles/banner'

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
  const { setCookieConsent } = useEvents()

  return (
    <>
      <NotionPage {...props} />
      <CookieBanner
        message='Wir verwenden kleine Kekse - auch genannt "Cookies". Willst du die auch?'
        wholeDomain={true}
        onAccept={() => setTimeout(() => setCookieConsent(true), 1000)}
        acceptButtonText='Ja, klar!'
        managePreferencesButtonText='Einstellungen'
        styles={bannerStyles}
      />
    </>
  )
}
