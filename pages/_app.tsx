import React from 'react'
// global styles shared across the entire site
import 'styles/global.css'

// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css'

// used for code syntax highlighting (optional)
// import 'prismjs/themes/prism-coy.css'

// this might be better for dark mode
// import 'prismjs/themes/prism-okaidia.css'

// used for collection views selector (optional)
// TODO: re-add if we enable collection view dropdowns
// import 'rc-dropdown/assets/index.css'

// used for rendering equations (optional)
// import 'katex/dist/katex.min.css'

// core styles for static tweet renderer (optional)

// global style overrides for notion
import 'styles/notion.css'

// global style overrides for prism theme (optional)
// import 'styles/prism-theme.css'

// here we're bringing in any languages we want to support for
// syntax highlighting via Notion's Code block
// import 'prismjs'
// import 'prismjs/components/prism-markup'
// import 'prismjs/components/prism-javascript'
// import 'prismjs/components/prism-typescript'
// import 'prismjs/components/prism-bash'

import { CookieBanner } from '@palmabit/react-cookie-law'
import { setAnalyticsCollectionEnabled } from 'firebase/analytics'
import { firebaseAnalytics } from 'lib/firebase'

export default function App({ Component, pageProps }) {
  const bannerStyles = {
    dialog: {
      position: 'fixed',
      bottom: '0px',
      left: '0px',
      right: '0px',
      padding: '12px',
      backgroundColor: 'white',
      borderTop: '2px solid rgb(235, 236, 237)'
    },
    button: {
      padding: '10px 16px',
      borderRadius: '4px',
      fontFamily: 'inherit',
      backgroundColor: 'rgb(223, 171, 1)',
      border: 'none',
      margin: '0px 16px'
    },
    message: {
      maxWidth: '66%',
      paddingBottom: '8px'
    }
  }

  return (
    <>
      <Component {...pageProps} />
      <CookieBanner
        message='Wir verwenden kleine Kekse - auch genannt "Cookies". Willst du die auch?'
        wholeDomain={true}
        onAccept={() => setAnalyticsCollectionEnabled(firebaseAnalytics, true)}
        acceptButtonText='Ja, klar!'
        managePreferencesButtonText='Einstellungen'
        styles={bannerStyles}
      />
    </>
  )
}
