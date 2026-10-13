import { View } from "react-native";
import { ICardProps } from "./card.interface";
import { cardStyles } from "./card.styles";

export default function Card(props: ICardProps) {
  const { children } = props;

  return <View style={cardStyles.container}>{children}</View>;
}
