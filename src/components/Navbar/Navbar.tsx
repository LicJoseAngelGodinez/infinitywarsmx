import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import styles from './Navbar.module.css'
import logo from '@/assets/logo.jpeg'

const NAV_ITEMS = [
  { label: 'Clan',     to: '/'         },
  { label: 'Guerra',   to: '/guerra'   },
  { label: 'Reglas',   to: '/reglas'   },
  { label: 'Registro', to: '/registro' },
]

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `${styles.navLink} ${isActive ? styles.active : ''}`
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isMobile, isTablet } = useBreakpoint()
  const showHamburger = isMobile || isTablet

  const close = () => setIsOpen(false)

  return (
    <>
      <header className={`${styles.header}${isMobile || isTablet ? ` ${styles.headerColapsed}` : ''}
      }`}>
        {showHamburger && (
          <button
            className={styles.hamburger}
            onClick={() => setIsOpen(true)}
            aria-label="Abrir menú"
          >
            <span /><span /><span />
          </button>
        )}
        <Link to="/" className={styles.brand}><img src={logo} alt="Infinity Wars MX" className={styles.logo} /></Link>

        {!showHamburger && (
          <nav className={styles.desktopNav}>
            {NAV_ITEMS.map(item => (
              <NavLink key={item.to} to={item.to} className={navLinkClass} end>
                {item.label}
              </NavLink>
            ))}
            <Link to="/login" className={styles.loginBtn}>Login</Link>
          </nav>
        )}

      </header>

      {/* Mobile — overlay pantalla completa */}
      {isMobile && isOpen && (
        <div className={styles.mobileOverlay}>
          <button className={styles.closeBtn} onClick={close} aria-label="Cerrar menú">✕</button>
          <nav className={styles.mobileNav}>
            {NAV_ITEMS.map(item => (
              <Link key={item.to} to={item.to} className={styles.mobileLink} onClick={close}>
                {item.label}
              </Link>
            ))}
            <Link to="/login" className={styles.mobileLoginBtn} onClick={close}>Login</Link>
          </nav>
        </div>
      )}

      {/* Tablet — sidebar 1/3 ancho */}
      {isTablet && isOpen && (
        <>
          <div className={styles.backdrop} onClick={close} />
          <div className={styles.sidebar}>
            <button className={styles.closeBtn} onClick={close} aria-label="Cerrar menú">✕</button>
            <nav className={styles.sidebarNav}>
              {NAV_ITEMS.map(item => (
                <Link key={item.to} to={item.to} className={styles.sidebarLink} onClick={close}>
                  {item.label}
                </Link>
              ))}
              <Link to="/login" className={styles.sidebarLoginBtn} onClick={close}>Login</Link>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
