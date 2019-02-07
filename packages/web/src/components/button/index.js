import React from "react";
import styled, { css } from "styled-components";

import RichBtn, { InputFileBtn } from "./editorBtns";
import Loader from "../loader";

const Button = ({
  style,
  loading,
  secondary,
  children,
  small,
  disabled,
  ...rest
}) => (
  <ButtonStyle
    style={style}
    disabled={loading || disabled}
    secondary={secondary}
    small={small}
    {...rest}
  >
    {loading ? <Loader inline={loading} /> : children}
  </ButtonStyle>
);

export const ButtonStyle = styled.button`
  display: flex;
  flex: none;
  align-self: center;
  align-items: center;
  justify-content: center;
  border-radius: 3.14px;
  font-weight: 600;
  white-space: nowrap;
  word-break: keep-all;
  cursor: ${props => (props.disabled ? `not-allowed` : `pointer`)};
  font-size: 15px;
  position: relative;
  text-align: center;
  padding: ${props => (props.small ? "9px 20px" : "12px 32px")};
  color: white;
  transition: box-shadow 0.2s ease-out;
  &:hover {
    box-shadow: ${props =>
      props.disabled ? "none" : `3px 3px 18px 0px #d3d3d9`};
  }
  ${props =>
    props.secondary &&
    css`
      width: 100%;
    `};
  ${props =>
    props.disabled
      ? css`
          background-color: ${props.secondary
            ? props.theme.disabled.secondary
            : props.theme.disabled.primary};
        `
      : css`
          background-color: ${props.secondary
            ? props.theme.color.secondary
            : props.theme.color.primary};
        `}
`;

export default Button;
export { RichBtn, InputFileBtn };
