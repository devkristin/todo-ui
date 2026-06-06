<script setup lang="ts">
defineProps<{ isHovered: boolean }>();
</script>

<template>
  <svg
    :class="['lotus-flower', { 'is-open': isHovered }]"
    viewBox="0 0 400 230"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Created with SVG-edit - https://svg-edit.googlecode.com/ -->
    <defs>
      <radialGradient r="0.5" cy="0.5" cx="0.5" spreadMethod="pad" id="svg_9">
        <stop stop-opacity="0.996094" offset="0.358093" stop-color="#020202" />
        <stop offset="0.990906" stop-opacity="0.003906" stop-color="#f9f6f4" />
      </radialGradient>
    </defs>
    <g>
      <path
        stroke="#eecea8"
        opacity="0.8"
        class="petal-center"
        fill="#eecea8"
        stroke-width="5"
        d="m200.24533,20.51144c-6.66667,-0.79083 -36.33333,39.54158 -36,78.29235c0.33333,38.75075 26.33333,76.71068 38,76.71068c11.66667,0 30.33333,-31.63327 31,-74.33819c0.66667,-42.70491 -26.33333,-79.87401 -33,-80.66484z"
        id="center"
      />

      <path
        opacity="0.8"
        id="r3"
        stroke="#d4a9fc"
        class="petal-r"
        fill="#d4a9fc"
        stroke-width="5"
        d="m336.23487,98.71768c-1.92148,-6.44208 -54.28302,-15.60342 -92.86226,1.93804c-38.57925,17.54146 -65.92882,58.17882 -61.18356,68.83685c4.74526,10.65803 43.94162,13.63989 86.87809,-4.74689c42.93647,-18.38679 69.08921,-59.58592 67.16773,-66.028z"
      />

      <path
        stroke="#a78bfa"
        opacity="0.8"
        id="l3"
        class="petal-l"
        fill="#a78bfa"
        stroke-width="5"
        d="m58.83696,99.15766c-3.50168,5.73853 24.72682,50.78087 63.57723,67.71331c38.8504,16.93244 87.35028,10.06543 92.09554,-0.5926c4.74526,-10.65803 -19.26626,-41.78186 -61.66042,-61.38671c-42.39415,-19.60485 -90.51067,-11.47253 -94.01235,-5.734z"
      />
    </g>
  </svg>
</template>

<style scoped>
.lotus-flower {
  width: 100%;
  height: auto;
  display: block;
}

.petal-l,
.petal-r {
  transition:
    transform 1.8s,
    fill 1s,
    stroke 1s;
  transform-origin: 50% 80%;
}

.petal-l {
  transform: rotate(15deg);
}
.petal-r {
  transform: rotate(-15deg);
}

.lotus-flower.is-open .petal-l,
.lotus-flower.is-open .petal-r {
  transform: rotate(0deg);
}
</style>
