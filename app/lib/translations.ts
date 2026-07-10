export interface Translations {
  headingText: string;
  subText: string;
  rewardCheckboxText: string;
  experienceHeading: string;
  experienceSubText: string;
  feedbackHeading: string;
  feedbackSubText: string;
  feedbackPlaceholder: string;
  feedbackThankYou: string;
  redirectText: string;
  redirectSubText: string;
  sendButton: string;
  sentiments: { id: string; emoji: string; label: string }[];
}

export const LANGUAGES: Record<string, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  nl: { label: "Nederlands", flag: "🇳🇱" },
  de: { label: "Deutsch", flag: "🇩🇪" },
  sv: { label: "Svenska", flag: "🇸🇪" },
  da: { label: "Dansk", flag: "🇩🇰" },
  no: { label: "Norsk", flag: "🇳🇴" },
  pl: { label: "Polski", flag: "🇵🇱" },
};

const translations: Record<string, Translations> = {
  en: {
    headingText: "We're happy to offer you a 50% refund on your order.",
    subText: "Your honest review helps us improve, and we value that.",
    rewardCheckboxText: "I agree to receive my reward via email.",
    experienceHeading: "How was your experience?",
    experienceSubText: "Select the feeling that best describes your time with us.",
    feedbackHeading: "We'd love to hear more",
    feedbackSubText: "Tell us what we can do better so we can improve your experience.",
    feedbackPlaceholder: "Share your thoughts...",
    feedbackThankYou: "Thank you for your feedback! We'll use it to improve.",
    redirectText: "Thank you! We're so glad!",
    redirectSubText: "Redirecting you to Trustpilot...",
    sendButton: "Send Feedback",
    sentiments: [
      { id: "disappointed", emoji: "\ud83d\ude1e", label: "DISAPPOINTED" },
      { id: "okay", emoji: "\ud83d\ude10", label: "IT WAS OKAY" },
      { id: "loved", emoji: "\ud83d\ude0d", label: "LOVED IT" },
    ],
  },
  nl: {
    headingText: "We bieden je graag 50% restitutie aan op je bestelling.",
    subText: "Jouw eerlijke review helpt ons verbeteren, en dat waarderen we.",
    rewardCheckboxText: "Ik ga akkoord om mijn beloning per e-mail te ontvangen.",
    experienceHeading: "Hoe was je ervaring?",
    experienceSubText: "Kies het gevoel dat het beste bij je ervaring past.",
    feedbackHeading: "We horen graag meer",
    feedbackSubText: "Vertel ons wat we beter kunnen doen zodat we je ervaring kunnen verbeteren.",
    feedbackPlaceholder: "Deel je gedachten...",
    feedbackThankYou: "Bedankt voor je feedback! We gebruiken het om te verbeteren.",
    redirectText: "Bedankt! Wat fijn om te horen!",
    redirectSubText: "We sturen je door naar Trustpilot...",
    sendButton: "Feedback versturen",
    sentiments: [
      { id: "disappointed", emoji: "\ud83d\ude1e", label: "TELEURGESTELD" },
      { id: "okay", emoji: "\ud83d\ude10", label: "HET WAS OKE" },
      { id: "loved", emoji: "\ud83d\ude0d", label: "GEWELDIG" },
    ],
  },
  de: {
    headingText: "Wir bieten Ihnen gerne 50% Erstattung auf Ihre Bestellung.",
    subText: "Ihre ehrliche Bewertung hilft uns, besser zu werden.",
    rewardCheckboxText: "Ich stimme zu, meine Belohnung per E-Mail zu erhalten.",
    experienceHeading: "Wie war Ihre Erfahrung?",
    experienceSubText: "Wählen Sie das Gefühl, das Ihre Erfahrung am besten beschreibt.",
    feedbackHeading: "Wir würden gerne mehr erfahren",
    feedbackSubText: "Sagen Sie uns, was wir besser machen können.",
    feedbackPlaceholder: "Teilen Sie Ihre Gedanken...",
    feedbackThankYou: "Vielen Dank für Ihr Feedback! Wir werden es nutzen, um uns zu verbessern.",
    redirectText: "Vielen Dank! Das freut uns sehr!",
    redirectSubText: "Wir leiten Sie zu Trustpilot weiter...",
    sendButton: "Feedback senden",
    sentiments: [
      { id: "disappointed", emoji: "\ud83d\ude1e", label: "ENTTÄUSCHT" },
      { id: "okay", emoji: "\ud83d\ude10", label: "ES WAR OKAY" },
      { id: "loved", emoji: "\ud83d\ude0d", label: "GELIEBT" },
    ],
  },
  sv: {
    headingText: "Vi erbjuder dig gärna 50% återbetalning på din beställning.",
    subText: "Din ärliga recension hjälper oss att förbättras, och det uppskattar vi.",
    rewardCheckboxText: "Jag godkänner att ta emot min belöning via e-post.",
    experienceHeading: "Hur var din upplevelse?",
    experienceSubText: "Välj den känsla som bäst beskriver din tid hos oss.",
    feedbackHeading: "Vi vill gärna höra mer",
    feedbackSubText: "Berätta vad vi kan göra bättre så att vi kan förbättra din upplevelse.",
    feedbackPlaceholder: "Dela dina tankar...",
    feedbackThankYou: "Tack för din feedback! Vi kommer att använda den för att förbättras.",
    redirectText: "Tack! Vad roligt att höra!",
    redirectSubText: "Vi skickar dig vidare till Trustpilot...",
    sendButton: "Skicka feedback",
    sentiments: [
      { id: "disappointed", emoji: "\ud83d\ude1e", label: "BESVIKEN" },
      { id: "okay", emoji: "\ud83d\ude10", label: "DET VAR OKEJ" },
      { id: "loved", emoji: "\ud83d\ude0d", label: "ÄLSKADE DET" },
    ],
  },
  da: {
    headingText: "Vi tilbyder dig gerne 50% refusion på din ordre.",
    subText: "Din ærlige anmeldelse hjælper os med at forbedre os, og det sætter vi pris på.",
    rewardCheckboxText: "Jeg accepterer at modtage min belønning via e-mail.",
    experienceHeading: "Hvordan var din oplevelse?",
    experienceSubText: "Vælg den følelse, der bedst beskriver din tid hos os.",
    feedbackHeading: "Vi vil gerne høre mere",
    feedbackSubText: "Fortæl os, hvad vi kan gøre bedre, så vi kan forbedre din oplevelse.",
    feedbackPlaceholder: "Del dine tanker...",
    feedbackThankYou: "Tak for din feedback! Vi bruger den til at forbedre os.",
    redirectText: "Tak! Det er vi glade for at høre!",
    redirectSubText: "Vi sender dig videre til Trustpilot...",
    sendButton: "Send feedback",
    sentiments: [
      { id: "disappointed", emoji: "\ud83d\ude1e", label: "SKUFFET" },
      { id: "okay", emoji: "\ud83d\ude10", label: "DET VAR OKAY" },
      { id: "loved", emoji: "\ud83d\ude0d", label: "ELSKEDE DET" },
    ],
  },
  no: {
    headingText: "Vi tilbyr deg gjerne 50% refusjon på din bestilling.",
    subText: "Din ærlige anmeldelse hjelper oss å bli bedre, og det setter vi pris på.",
    rewardCheckboxText: "Jeg godtar å motta belønningen min via e-post.",
    experienceHeading: "Hvordan var opplevelsen din?",
    experienceSubText: "Velg følelsen som best beskriver tiden din hos oss.",
    feedbackHeading: "Vi vil gjerne høre mer",
    feedbackSubText: "Fortell oss hva vi kan gjøre bedre slik at vi kan forbedre opplevelsen din.",
    feedbackPlaceholder: "Del dine tanker...",
    feedbackThankYou: "Takk for tilbakemeldingen! Vi bruker den til å forbedre oss.",
    redirectText: "Takk! Det er vi glade for å høre!",
    redirectSubText: "Vi sender deg videre til Trustpilot...",
    sendButton: "Send tilbakemelding",
    sentiments: [
      { id: "disappointed", emoji: "\ud83d\ude1e", label: "SKUFFET" },
      { id: "okay", emoji: "\ud83d\ude10", label: "DET VAR GREIT" },
      { id: "loved", emoji: "\ud83d\ude0d", label: "ELSKET DET" },
    ],
  },
  pl: {
    headingText: "Z przyjemnością oferujemy Ci 50% zwrotu za zamówienie.",
    subText: "Twoja szczera opinia pomaga nam się rozwijać i bardzo ją cenimy.",
    rewardCheckboxText: "Wyrażam zgodę na otrzymanie nagrody drogą mailową.",
    experienceHeading: "Jak oceniasz swoje doświadczenie?",
    experienceSubText: "Wybierz uczucie, które najlepiej opisuje Twoje wrażenia.",
    feedbackHeading: "Chętnie dowiemy się więcej",
    feedbackSubText: "Powiedz nam, co możemy poprawić, abyśmy mogli ulepszyć Twoje doświadczenie.",
    feedbackPlaceholder: "Podziel się swoimi przemyśleniami...",
    feedbackThankYou: "Dziękujemy za opinię! Wykorzystamy ją, aby się poprawić.",
    redirectText: "Dziękujemy! Bardzo się cieszymy!",
    redirectSubText: "Przekierowujemy Cię do Trustpilot...",
    sendButton: "Wyślij opinię",
    sentiments: [
      { id: "disappointed", emoji: "\ud83d\ude1e", label: "ROZCZAROWANY" },
      { id: "okay", emoji: "\ud83d\ude10", label: "BYŁO OKEJ" },
      { id: "loved", emoji: "\ud83d\ude0d", label: "WSPANIALE" },
    ],
  },
};

export function getTranslations(language: string): Translations {
  return translations[language] || translations.en;
}
