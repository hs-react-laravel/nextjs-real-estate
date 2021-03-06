import { useEffect, useRef } from 'react'
import IntercomAPI from './intercomAPI'

interface IntercomSettings {
  app_id: string
  [x: string]: string
}

declare global {
  interface Window {
    Intercom: (...args: Array<any>) => any
    intercomSettings: IntercomSettings
    attachEvent?: any
  }
}

interface ReactIntercomAvatar {
  type: string
  image_url: string
}

interface ReactIntercomCompany {
  company_id: string
  created_at?: string
  name?: string
  monthy_spend?: number
  plan?: string
  size?: number
  website?: string
  industry?: string
}

interface ReactIntercomDataAttributes {
  email?: string
  user_id?: string
  created_at?: string
  name?: string
  phone?: string
  last_request_at?: void // reserved, can't be updated
  unsubscribed_from_emails?: boolean
  language_override?: string
  utm_campaign?: string
  utm_content?: string
  utm_medium?: string
  utm_source?: string
  utm_term?: string
  avatar?: ReactIntercomAvatar
  user_hash?: string
  company?: ReactIntercomCompany
  companies?: ReactIntercomCompany[]
  [custom_property: string]: any
}

interface ReactIntercomProps extends ReactIntercomDataAttributes {
  app_id: string
  alignment?: string
  horizontal_padding?: number
  vertical_padding?: number
  custom_launcher_selector?: string
  hide_default_launcher?: string
  session_duration?: string
  action_color?: string
  background_color?: string
}

function ReactIntercom<T extends ReactIntercomProps>(props: T) {
  if (typeof window === 'undefined') return null

  // Keep intercomSettings in sync
  window.intercomSettings = props
  if (window && window.Intercom) IntercomAPI('update')

  // Iinitialization
  useEffect(() => {
    if (!props.app_id) {
      return
    }
    ;(function() {
      const w = window
      const ic = w.Intercom
      if (typeof ic === 'function') {
        ic('reattach_activator')
        ic('update', w.intercomSettings)
      } else {
        const d = document
        const i: any = function(...args: any[]) {
          i.c(args)
        }
        i.q = []
        i.c = function(args: any) {
          i.q.push(args)
        }
        w.Intercom = i
        const l = function() {
          const s = d.createElement('script')
          s.type = 'text/javascript'
          s.async = true
          s.src = 'https://widget.intercom.io/widget/' + props.app_id
          const x = d.getElementsByTagName('script')[0]
          x.parentNode && x.parentNode.insertBefore(s, x)
        }
        if (document.readyState === 'complete') {
          l()
        } else if (w.attachEvent) {
          w.attachEvent('onload', l)
        } else {
          w.addEventListener('load', l, false)
        }
      }
    })()

    return () => {
      IntercomAPI('shutdown')
      delete window.Intercom
      delete window.intercomSettings
    }
  }, [])

  const lastUser = useRef(props.user_id || props.email)
  useEffect(() => {
    if (lastUser.current) {
      // If the user was previously logged in, shut down and start over
      IntercomAPI('shutdown')
      IntercomAPI('boot', { ...props })
    } else if (props.user_id || props.email) {
      // If the user was not logged in, just call 'update' to let Intercom know
      IntercomAPI('update')
    }

    lastUser.current = props.user_id || props.email
  }, [props.user_id, props.email])

  return null
}

export { ReactIntercom, IntercomAPI }
