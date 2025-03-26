import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Text,
  SafeAreaView,
} from "react-native";
import {Link} from "expo-router";
import {LinearGradient} from "expo-linear-gradient";

import {ThemedText} from "@/components/ThemedText";
import {ThemedView} from "@/components/ThemedView";

interface FeatureCardProps {
  title: string;
  emoji: string;
  description: string;
  linkTo: string;
}

const FeatureCard = ({title, emoji, description, linkTo}: FeatureCardProps) => (
  <Link href={linkTo as any} asChild>
    <TouchableOpacity>
      <ThemedView style={styles.featureCard}>
        <Text style={styles.featureEmoji}>{emoji}</Text>
        <ThemedText type="subtitle" style={styles.featureTitle}>
          {title}
        </ThemedText>
        <ThemedText style={styles.featureDescription}>{description}</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  </Link>
);

interface QuoteCardProps {
  quote: string;
  author: string;
}

const QuoteCard = ({quote, author}: QuoteCardProps) => (
  <ThemedView style={styles.quoteCard}>
    <ThemedText style={styles.quoteText}>"{quote}"</ThemedText>
    <ThemedText style={styles.quoteAuthor}>— {author}</ThemedText>
  </ThemedView>
);

export default function HomeScreen() {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: "#fff"}}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        {/* Colorful Welcome Header */}
        <LinearGradient
          colors={["#FF9F4A", "#FF6B8A"]}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <View style={styles.headerContent}>
            <Text style={styles.welcome}>Hey Bestie! 👋</Text>
            <Text style={styles.tagline}>
              Your ultimate vibe curator & mental health hype-friend
            </Text>
          </View>
        </LinearGradient>

        {/* App Introduction */}
        <View style={styles.introContainer}>
          <Text style={styles.introText}>
            Spill the tea ☕, vent about the icks 😤, or just vibe with me - no
            judgment, just good energy ✨
          </Text>
        </View>

        {/* Quick Access Buttons */}
        <View style={styles.quickLinksContainer}>
          <Link href="/chat" asChild>
            <TouchableOpacity
              style={[styles.quickLinkButton, styles.chatButton]}>
              <Text style={styles.quickLinkText}>Start Vibing 💫</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/mood" asChild>
            <TouchableOpacity
              style={[styles.quickLinkButton, styles.moodButton]}>
              <Text style={styles.quickLinkText}>Mood Diary 📓</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Features Section */}
        <Text style={styles.sectionTitle}>Why You'll Love This</Text>
        <View style={styles.featuresContainer}>
          <FeatureCard
            title="Real Talk Only"
            emoji="💯"
            description="Keep it 💯 with me - no toxic positivity, just real convos"
            linkTo="/chat"
          />
          <FeatureCard
            title="Vibe Analytics"
            emoji="📊"
            description="Track your mood waves & slay your feels"
            linkTo="/mood"
          />
          <FeatureCard
            title="Lit Strategies"
            emoji="🔥"
            description="Get hype-approved ways to handle stress"
            linkTo="/chat"
          />
        </View>

        {/* Affirmations/Quotes Section */}
        <Text style={styles.sectionTitle}>Daily Hype 💪</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quotesScrollContainer}>
          <QuoteCard
            quote="You're the main character - act like it! 🎬"
            author="Gen Z Wisdom"
          />
          <QuoteCard
            quote="Bad vibes? Not today, Satan! 😇"
            author="Mood Mantra"
          />
          <QuoteCard
            quote="Progress > Perfection, always 🏆"
            author="Growth Gang"
          />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Remember: You're that girl 💅 - and we stan!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 200,
    paddingHorizontal: 25,
    paddingTop: 50,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerContent: {
    alignItems: "flex-start",
  },
  welcome: {
    fontSize: 34,
    fontWeight: "800",
    color: "white",
    marginBottom: 8,
    fontFamily: "Inter_900Black",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 18,
    color: "white",
    opacity: 0.95,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 24,
  },
  introContainer: {
    margin: 25,
    marginTop: 30,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#FFF8F6",
    borderLeftWidth: 5,
    borderLeftColor: "#FF9F4A",
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    fontFamily: "Inter_500Medium",
  },
  quickLinksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 25,
    marginBottom: 25,
    gap: 15,
  },
  quickLinkButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  chatButton: {
    backgroundColor: "#FF6B8A",
  },
  moodButton: {
    backgroundColor: "#6B9AFF",
  },
  quickLinkText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  sectionTitle: {
    marginLeft: 25,
    marginTop: 15,
    marginBottom: 20,
    fontSize: 22,
    fontWeight: "800",
    color: "#333",
    fontFamily: "Inter_800ExtraBold",
  },
  featuresContainer: {
    paddingHorizontal: 25,
    gap: 15,
  },
  featureCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  featureEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
    fontFamily: "Inter_700Bold",
  },
  featureDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  quotesScrollContainer: {
    paddingLeft: 25,
    paddingRight: 15,
  },
  quoteCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    padding: 20,
    marginRight: 15,
    width: 280,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quoteText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
    color: "#444",
    fontStyle: "italic",
    fontFamily: "Inter_500Medium",
  },
  quoteAuthor: {
    fontSize: 12,
    color: "#888",
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    marginTop: 35,
    marginBottom: 25,
    paddingHorizontal: 25,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Inter_500Medium",
  },
});
