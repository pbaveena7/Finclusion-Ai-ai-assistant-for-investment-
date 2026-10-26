import { useState, useEffect, useRef } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
]

export default function GoogleTranslateWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState(() => {
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/)
    return match ? match[1] : 'en'
  })
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Define global callback if not yet defined
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
            multilanguagePage: true,
          },
          'google_translate_hidden_container'
        )
      }
    }

    // If script loaded already, initialize directly
    if (window.google && window.google.translate) {
      window.googleTranslateElementInit()
    }

    const killerInterval = setInterval(() => {
      const banner = document.querySelector('.goog-te-banner-frame')
      if (banner) {
        banner.style.display = 'none'
        banner.style.height = '0px'
        banner.style.visibility = 'hidden'
      }
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px'
      }
    }, 500)

    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      clearInterval(killerInterval)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const changeLanguage = (langCode) => {
    setSelectedLang(langCode)
    setIsOpen(false)

    // Set Google translate cookie across domain roots
    const cookieValue = `/en/${langCode}`
    document.cookie = `googtrans=${cookieValue}; path=/;`
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`
    document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname}`

    const selectElem = document.querySelector('.goog-te-combo')
    if (selectElem) {
      selectElem.value = langCode
      selectElem.dispatchEvent(new Event('change'))
    } else {
      window.location.reload()
    }
  }

  const currentLangObj = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0]

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div id="google_translate_hidden_container" style={{ display: 'none' }} />

      {/* Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 0.85rem',
          borderRadius: '0.75rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: '#09090b',
          border: '1px solid #3f3f46',
          color: '#ffffff',
          cursor: 'pointer'
        }}
      >
        <Globe size={14} color="#ffffff" style={{ flexShrink: 0 }} />
        <span style={{ fontFamily: 'monospace', color: '#ffffff' }}>{currentLangObj.name}</span>
        <span style={{ opacity: 0.7, fontSize: '0.6875rem', color: '#d4d4d8' }}>({currentLangObj.native})</span>
        <ChevronDown size={13} color="#ffffff" style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          marginTop: '0.5rem',
          width: '16rem',
          borderRadius: '0.75rem',
          backgroundColor: '#09090b',
          border: '1px solid #3f3f46',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '0.5rem 0.85rem',
            fontSize: '0.625rem',
            fontFamily: 'monospace',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid #27272a',
            backgroundColor: '#050505',
            color: '#a1a1aa'
          }}>
            Select Language
          </div>
          <div style={{ maxHeight: '15rem', overflowY: 'auto', padding: '0.25rem' }}>
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === selectedLang
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#ffffff' : 'transparent',
                    color: isSelected ? '#000000' : '#ffffff',
                    fontWeight: isSelected ? 800 : 500,
                    marginBottom: '0.125rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#18181b'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <span style={{ color: isSelected ? '#000000' : '#ffffff' }}>
                    {lang.name} ({lang.native})
                  </span>
                  {isSelected && <Check size={14} color="#000000" style={{ flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
