import Svg, { Path } from "react-native-svg";

const Logo = ({ style }) => {
  return (
    <Svg
      width="318"
      height="240"
      viewBox="0 0 424 319"
      style={style} // Acepta estilos desde el componente padre
    >
      {/* Logo shape */}
      <Path
        d="M77.5 1H1L93.5 318.5H171L263.5 1H186.5L131 215L77.5 1Z M345.5 1H423L330.5 318.5H252.5L222 213.5H290L345.5 1Z"
        fill="rgba(255, 255, 255, 0.15)"
      />
    </Svg>
  );
};

export default Logo;
