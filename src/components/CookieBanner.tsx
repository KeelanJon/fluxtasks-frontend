import React, { useState, useEffect } from "react"

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent")
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner">
      <p>
        We collect your email address to allow you to sign in to your account.
        Your email is stored securely and never shared. You can request deletion
        at any time by contacting{" "}
        <a href="mailto:info@keelsdesign.co.uk">info@keelsdesign.co.uk</a>
      </p>
      <button className="add-button" onClick={handleAccept}>
        Got it
      </button>
    </div>
  )
}

export default CookieBanner
