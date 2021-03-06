<style lang="sass">
  @import '../../styleguide/animations';

  .kiln-field {
    border: none;
    flex: 0 0 100%;
    margin: 0 0 16px;
    min-width: 0;
    opacity: 1;
    padding: 0;
    position: relative;
    transition: opacity $standard-time $standard-curve;
    visibility: visible;
    width: 100%;

    .editor-inline & {
      margin: 0;
    }

    .reveal-enter,
    .reveal-leave-to {
      opacity: 0;
    }

    .reveal-enter-to,
    .reveal-leave {
      opacity: 1;
    }

    .reveal-enter-active,
    .reveal-leave-active {
      transition: opacity $standard-time $standard-curve;
    }
  }
</style>

<template>
  <transition name="reveal" mode="out-in" @after-enter="onRevealResize">
    <fieldset class="kiln-field" v-if="inputName && isShown" :key="name">
      <component :is="inputName" :name="name" :data="data" :schema="schema" :args="expandedInput" @resize="onResize"></component>
    </fieldset>
  </transition>
</template>

<script>
  import _ from 'lodash';
  import { fieldProp, inputProp, revealProp } from '../utils/references';
  import { shouldBeRevealed } from './field-helpers';
  import { expand } from './inputs';

  export default {
    props: ['name', 'data', 'schema'],
    data() {
      return {};
    },
    computed: {
      expandedInput() {
        return expand(this.schema[fieldProp]);
      },
      inputName() {
        return this.expandedInput[inputProp];
      },
      hasReveal() {
        return _.has(this.schema, revealProp);
      },
      isShown() {
        const revealConfig = _.get(this.schema, revealProp, {});

        return shouldBeRevealed(this.$store, revealConfig, this.name);
      }
    },
    methods: {
      onResize(additionalPixels) {
        this.$root.$emit('resize-form', additionalPixels); // pass this to the form component
      },
      onRevealResize() {
        if (this.hasReveal) {
          this.$root.$emit('resize-form');
        }
      }
    },
    components: window.kiln.inputs
  };
</script>
