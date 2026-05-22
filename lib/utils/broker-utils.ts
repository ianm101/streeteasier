/**
 * Detect if an email is likely a broker thread (vs a single apartment listing)
 * Broker threads typically:
 * - Come from a real estate broker email
 * - May mention multiple properties
 * - Have ongoing back-and-forth conversation
 */
export function isBrokerThread(
  emailFrom: string,
  subject: string,
  messageCount: number
): boolean {
  const brokerDomains = [
    "corcoran.com",
    "compass.com",
    "citihabitats.com",
    "elliman.com",
    "halstead.com",
    "sothebysrealty.com",
    "brownharrisstevens.com",
  ];

  const lowerFrom = emailFrom.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  // Check if from a broker domain
  const isFromBroker = brokerDomains.some((domain) => lowerFrom.includes(domain));

  // Check for inquiry/conversation keywords (not automated listings)
  const isConversation =
    lowerSubject.includes("re:") ||
    lowerSubject.includes("inquiry") ||
    lowerSubject.includes("tour") ||
    lowerSubject.includes("showing") ||
    lowerSubject.includes("application") ||
    messageCount > 1;

  // Exclude automated StreetEasy emails (those are apartment listings)
  const isStreetEasyAutomated =
    lowerFrom.includes("streeteasy.com") && lowerFrom.includes("noreply");

  return isFromBroker && isConversation && !isStreetEasyAutomated;
}
