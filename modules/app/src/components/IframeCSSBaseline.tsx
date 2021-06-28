export default function IframeCSSBaseline() {
  return (
    <style global jsx>{`
      html,
      body {
        height: 100%;
        overflow: hidden;
      }
      #__next {
        width: 100%;
        height: 100%;
      }
    `}</style>
  );
}
