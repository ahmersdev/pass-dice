import { Text, View } from "react-native";
import { ISectionCardProps } from "./section-card.interface";
import { sectionCardStyles } from "./section-card.styles";

export default function SectionCard(props: ISectionCardProps) {
  const { title, trailing, children } = props;

  return (
    <View style={sectionCardStyles.container}>
      <View style={sectionCardStyles.header}>
        <Text accessibilityRole="header" style={sectionCardStyles.title}>
          {title}
        </Text>
        {trailing}
      </View>
      {children}
    </View>
  );
}
