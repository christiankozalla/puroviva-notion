import { useEffect, useState } from 'react'
import { domain } from 'lib/config'
import { resolveNotionPage } from 'lib/resolve-notion-page'
import { NotionPage } from 'components'

import { useEvents } from 'lib/useEvents'
import { PageProps } from 'lib/types'

import { CookieBanner } from '@palmabit/react-cookie-law'
import { bannerStyles } from '../styles/banner'

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
  const { setCookieConsent } = useEvents()

  return (
    <>
      <NotionPage {...props} />
      <CookieBanner
        message='Wir verwenden kleine Kekse - auch genannt "Cookies". Willst du die auch?'
        wholeDomain={true}
        onAccept={() => setTimeout(() => setCookieConsent(true), 200)}
        acceptButtonText='Ja, klar!'
        managePreferencesButtonText='Einstellungen'
        styles={bannerStyles}
      />
    </>
  )
}
