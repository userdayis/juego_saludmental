import { Component, type ErrorInfo, type ReactNode } from 'react'
import { getLang, translate } from '../i18n'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary', error, info)
  }

  render() {
    if (this.state.hasError) {
      const lang = getLang()
      return (
        <div className="error-screen" role="alert">
          <span className="error-screen__icon" aria-hidden="true">
            😕
          </span>
          <h1 className="error-screen__title">{translate(lang, 'error.title')}</h1>
          <p className="error-screen__text">{translate(lang, 'error.text')}</p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => window.location.reload()}
          >
            {translate(lang, 'error.reload')}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
