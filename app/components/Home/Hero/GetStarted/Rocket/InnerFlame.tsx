import styled from "styled-components";

import { flame } from "./keyframes";

const StyledDiv = styled.div`
  animation: ${flame} 4.8s reverse infinite;
  left: 66px;
  position: absolute;
  top: 283px;
  z-index: 1;
`;

export default function InnerFlame(): JSX.Element {
  return (
    <StyledDiv>
      <svg
        width="126"
        height="139"
        viewBox="0 0 126 139"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M53.1228 0C53.1228 0 1.3421 17.0353 0.0851822 73.977C-1.0481 125.946 9.64597 123.747 1.44512 131.309C1.21562 131.53 1.0485 131.807 0.9606 132.112C0.872697 132.418 0.867121 132.741 0.944432 133.05C1.02174 133.358 1.17921 133.641 1.40096 133.869C1.62271 134.097 1.90091 134.263 2.20752 134.35C19.5777 139.097 109.066 154.201 125.838 67.504L53.1228 0Z"
          fill="#F5BF59"
        />
        <path
          d="M63.0131 31.0909C63.0131 31.0909 36.3501 27.9468 33.1975 61.9146C30.3128 92.7383 31.8788 103.013 26.6863 107.123C26.5408 107.244 26.43 107.401 26.3652 107.578C26.3004 107.756 26.2839 107.947 26.3174 108.133C26.3509 108.319 26.4332 108.492 26.5559 108.636C26.6786 108.78 26.8373 108.889 27.0159 108.952C37.1537 112.507 89.7792 125.268 103.44 74.388L63.0131 31.0909Z"
          fill="white"
        />
      </svg>
    </StyledDiv>
  );
}
