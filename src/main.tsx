import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ConfigProvider } from 'antd'
import frFR from 'antd/locale/fr_FR'
import './config/dayjs.config'

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'
import { AbilityProvider } from './auth/ability-context'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

// Create a new router instance

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()

const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ConfigProvider
        locale={frFR}
        theme={{
          token: {
            colorPrimary: '#4f46e5',
            borderRadius: 8,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            motionDurationMid: '0.2s',
            motionDurationSlow: '0.3s',
            controlHeight: 36,
            controlHeightLG: 44,
            fontWeightStrong: 600,
            wireframe: false,
          },
          components: {
            Button: {
              controlHeight: 36,
              controlHeightLG: 44,
              paddingInline: 16,
              fontWeight: 500,
            },
            Card: {
              borderRadiusLG: 12,
              boxShadowTertiary: '0 1px 3px -1px rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.02)',
            },
            Table: {
              headerBg: 'oklch(0.97 0.005 250)',
              headerColor: 'oklch(0.45 0.02 260)',
              rowHoverBg: 'oklch(0.97 0.008 250)',
              borderColor: 'oklch(0.92 0.006 250)',
              cellPaddingBlock: 14,
            },
            Modal: {
              borderRadiusLG: 12,
            },
            Tag: {
              borderRadiusSM: 6,
            },
            Input: {
              controlHeight: 36,
              activeShadow: '0 0 0 2px rgba(79, 70, 229, 0.1)',
            },
            Select: {
              controlHeight: 36,
              controlHeightLG: 44,
            },
            DatePicker: {
              controlHeight: 36,
            },
            Menu: {
              itemBorderRadius: 8,
              itemHeight: 36,
            },
            Tooltip: {
              borderRadius: 8,
              paddingXS: 8,
            },
            Popconfirm: {
              borderRadiusLG: 12,
            },
          },
        }}
      >
        <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
          <AbilityProvider>
            <RouterProvider router={router} />
          </AbilityProvider>
        </TanStackQueryProvider.Provider>
      </ConfigProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
