// RatingComponent.js
import { Cat } from "lucide-react";
import { Box } from "@mui/material";
import { useState } from "react";

const RatingComponent = ({ value, onChange }) => {
  const maxRating = 5;
  const handleClick = (index) => {
    onChange(index + 1);
  };

  return (
    <Box display="flex" alignItems="center">
      {[...Array(maxRating)].map((_, index) => (
        <Cat
          key={index}
          size={24}
          color={value > index ? "#660000" : "gray"}
          style={{
            cursor: "pointer",
            transform: value > index ? "scale(1.2)" : "scale(1)",
            transition: "transform 0.2s",
          }}
          onClick={() => handleClick(index)}
        />
      ))}
    </Box>
  );
};

export default RatingComponent;
