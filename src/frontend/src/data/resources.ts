import type { SafetyResource } from "@/types";

/**
 * Curated safety resources for the SafeHer hub. This is local, hand-curated
 * content — no backend needed. Each entry carries a full detail body rendered
 * in the resource detail view.
 */
export const resources: SafetyResource[] = [
  {
    id: "helplines-1",
    title: "National emergency number",
    category: "helplines",
    summary: "Call 911 (US) or your local emergency number for immediate help.",
    content:
      "In an emergency, call 911 (United States) or your local emergency number right away. Emergency operators are trained to help you stay calm, describe your situation, and dispatch the right responders.\n\nIf you cannot speak safely, many regions support texting 911 or using a silent call. Know your location and be ready to share it. Stay on the line until the operator tells you it is safe to hang up.\n\nSave your local emergency number in your phone and add it to your SOS contacts so help is always one tap away.",
  },
  {
    id: "helplines-2",
    title: "Domestic violence hotline",
    category: "helplines",
    summary: "Confidential support and resources, available 24/7.",
    content:
      "If you are experiencing domestic or intimate partner violence, you are not alone. Confidential advocates are available around the clock to listen, help you plan for safety, and connect you with local services.\n\nIn the US, the National Domestic Violence Hotline is available 24/7 at 1-800-799-7233, with text and chat options. Calls are confidential and you can reach out even if you are not ready to leave.\n\nAn advocate can help you create a safety plan, understand your options, and find shelters, legal help, and counseling near you. Your safety and your choices are always respected.",
  },
  {
    id: "helplines-3",
    title: "Crisis support line",
    category: "helplines",
    summary: "Someone to talk to when you need immediate emotional support.",
    content:
      "When you are feeling overwhelmed, in crisis, or just need someone to talk to, crisis support lines are there for you. In the US, call or text 988 to reach the Suicide & Crisis Lifeline, available 24/7 and free and confidential.\n\nTrained counselors listen without judgment and can help you work through what you are feeling. You can call for yourself or for someone you are worried about.\n\nIf you are in immediate danger, call your local emergency number. You deserve support, and reaching out is a sign of strength.",
  },
  {
    id: "self-defense-1",
    title: "Stay aware of your surroundings",
    category: "self-defense",
    summary: "Simple awareness habits that help you stay in control.",
    content:
      "Awareness is your first and most powerful layer of self-defense. Being present and observant helps you notice potential risks early, when you still have options.\n\nKeep your head up and your phone out of your face when walking. Notice who is around you, where the exits are, and which areas are well lit. Trust your instincts — if a place or person feels off, act on that feeling and move to a safer spot.\n\nShare your route with a trusted contact and let them know when you arrive. Small habits, practiced daily, build confidence and keep you in control.",
  },
  {
    id: "self-defense-2",
    title: "Basic self-defense moves",
    category: "self-defense",
    summary: "A few practical techniques to create space and escape.",
    content:
      "The goal of self-defense is to create distance and escape, not to win a fight. These simple techniques can help you break free and get to safety.\n\nUse your voice loudly and clearly — shout for help and draw attention. Target vulnerable areas like the eyes, nose, and throat with quick, forceful strikes. Use your elbows, knees, and palms, which are strong and don't require training.\n\nPractice with a trusted friend or a local self-defense class so the movements feel natural under stress. Carry a loud whistle or personal alarm to attract attention. Your priority is always to get away and reach help.",
  },
  {
    id: "self-defense-3",
    title: "Personal safety alarms",
    category: "self-defense",
    summary: "Small devices that make a loud sound to deter and attract help.",
    content:
      "A personal safety alarm is a small, inexpensive device that emits a very loud sound when activated. The noise can startle an attacker, draw attention, and give you a moment to escape.\n\nKeep your alarm somewhere you can reach quickly, like a keychain or a pocket. Test it regularly so you know it works and how loud it is. Some models also include a bright light or a built-in flashlight.\n\nAn alarm is a tool, not a guarantee — pair it with awareness, a charged phone, and a plan for getting to safety. Practice reaching for it so it becomes automatic.",
  },
  {
    id: "travel-1",
    title: "Share your route",
    category: "travel-safety",
    summary:
      "Tell a trusted contact where you're going and when you'll arrive.",
    content:
      "Before you head out, tell a trusted contact where you are going, how you plan to get there, and when you expect to arrive. This simple habit means someone knows to check on you if you don't show up.\n\nUse your phone's location-sharing feature with a trusted contact for the duration of your trip, and turn it off when you arrive. Set a check-in time and follow through — a quick message lets your contact know you're safe.\n\nIf your plans change, update your contact. The more people who know your whereabouts, the safer you are.",
  },
  {
    id: "travel-2",
    title: "Safe transport tips",
    category: "travel-safety",
    summary: "How to choose safe rides and verify your driver.",
    content:
      "Whether you're taking a rideshare, taxi, or public transit, a few checks keep you safer. Before getting in any car, verify the driver and the vehicle match what the app shows.\n\nCheck the license plate, make, and model, and confirm the driver's name and photo. Sit in the back seat and share your trip details with a trusted contact. Follow the route on your own map so you can notice if the driver deviates.\n\nOn public transit, sit near other passengers and in well-lit areas. Trust your instincts — if a ride feels wrong, don't get in, and cancel if anything seems off.",
  },
  {
    id: "travel-3",
    title: "Hotel and accommodation safety",
    category: "travel-safety",
    summary: "Check-ins, room checks, and staying secure while you travel.",
    content:
      "When you check into a hotel or rental, take a few minutes to secure your space. Ask for a room near the elevator and away from isolated stairwells and exits.\n\nCheck that all doors and windows lock properly, and use the deadbolt and security chain when you're inside. Keep your door locked even when you're in the room, and never open it without verifying who is there.\n\nShare your room number and check-in details with a trusted contact. Know the emergency exits and keep your phone charged. A little preparation makes your stay much safer.",
  },
  {
    id: "digital-1",
    title: "Protect your accounts",
    category: "digital-safety",
    summary: "Strong passwords, two-factor auth, and location privacy.",
    content:
      "Strong account security keeps your personal information and location out of the wrong hands. Use a unique, strong password for every account, and store them in a password manager.\n\nTurn on two-factor authentication (2FA) wherever it's available — it adds a second layer of protection even if your password is compromised. Use an authenticator app rather than SMS when you can.\n\nReview your privacy settings regularly. Limit who can see your location, posts, and personal details, and be thoughtful about what you share publicly. Your digital footprint is part of your safety.",
  },
  {
    id: "digital-2",
    title: "Share your location safely",
    category: "digital-safety",
    summary: "Control who can see your location and when.",
    content:
      "Location sharing is a powerful safety tool, but only when you control it. Share your live location only with people you trust, and only for as long as you need to.\n\nMost phones let you share location for a specific time window or until you turn it off. Use these limits instead of sharing indefinitely. Review which apps have location access and revoke any you don't use.\n\nBe careful about posting photos and updates in real time — they can reveal where you are. Consider sharing after you've left a place, and turn off location tags on social media when you want to stay private.",
  },
  {
    id: "digital-3",
    title: "Recognize and avoid online scams",
    category: "digital-safety",
    summary: "Spot phishing, fake profiles, and requests for personal info.",
    content:
      "Online scams target everyone, and knowing the warning signs keeps you safe. Be wary of messages that create urgency, ask for money or personal information, or come from people you don't know.\n\nNever share passwords, codes, or financial details in response to an unexpected message, even if it looks official. Verify requests through a trusted channel before acting. Be cautious with people you meet online who quickly ask for money or intimate photos.\n\nIf something feels off, trust that feeling and stop engaging. Report suspicious accounts and block them. Your safety online matters as much as your safety in person.",
  },
];
