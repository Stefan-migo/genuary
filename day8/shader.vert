attribute vec3 aPosition;
attribute vec4 aColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec4 vColor;

void main() {
  vec4 position = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * position;
  gl_PointSize = 5.0; // Larger points for visibility
  vColor = aColor;
}