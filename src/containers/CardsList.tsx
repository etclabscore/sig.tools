import React from "react";
import { ButtonBase } from "@material-ui/core";
import { ICard } from "../machines/appMachine";
import CardView from "./CardView";
import EmptyCard from "../components/EmptyCard";

interface IProps {
  cards: ICard[];
  onCardSelect?: (card: ICard) => void;
}

const TAB_INDEX_START = 3;

const CardsList: React.FC<IProps> = ({ cards, onCardSelect }) => {
  return (
    <>
      {cards.length === 0 && <EmptyCard />}
      {cards.map((card, i) => (
        <ButtonBase key={i}
          onClick={() => onCardSelect && onCardSelect(card)}
          tabIndex={i + TAB_INDEX_START}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.keyCode === 13 && onCardSelect) {
              onCardSelect(card);
            }
          }}
          style={{
            margin: "4px",
            padding: "0",
            borderRadius: "10px",
            position: "relative",
            textAlign: "left",
          }}
        >
          <CardView card={card} />
        </ButtonBase>
      ))}
    </>
  );
};

export default CardsList;
