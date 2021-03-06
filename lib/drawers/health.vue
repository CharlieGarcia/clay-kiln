<style lang="sass">
  @import '../../styleguide/colors';
  @import '../../styleguide/typography';

  .health-drawer {
    height: 100%;
    overflow-y: scroll;
    padding: 16px 0;

    .validation-info {
      @include type-caption();

      color: $text-color;
      font-weight: bold;
      margin: 16px 0 8px 16px;
      text-transform: uppercase;
    }

    .validation-items {
      list-style: none;
      margin: 0 0 0 16px;
      padding: 0;
    }

    .validation-item {
      padding-left: 16px;
      position: relative;

      &:before {
        color: $brand-primary-color;
        content: '• ';
        left: 0;
        position: absolute;
        top: 2px;
      }
    }

    .validation-item + .validation-item {
      margin-top: 8px;
    }

    .validation-item-location {
      @include type-body();

      &.validation-item-link {
        color: $brand-primary-color;
        cursor: pointer;
        font-weight: bold;
        text-decoration: underline;
      }
    }

    .validation-item-preview {
      @include type-caption();

      font-style: italic;
      margin-left: 4px;
    }
  }

  .publish-valid {
    display: flex;
    flex-direction: column;
    padding: 0 16px;

    .valid-label {
      @include type-subheading();

      color: $md-green;
      // font-weight: bold;
      margin-bottom: 8px;
      // text-transform: uppercase;
    }

    .valid-description {
      @include type-caption();
    }
  }

  .publish-error {
    border-bottom: 1px solid $divider-color;
    display: flex;
    flex-direction: column;
    padding: 16px;

    &:first-of-type {
      padding-top: 0;
    }

    .error-label {
      @include type-subheading();

      color: $md-red;
      // font-weight: bold;
      margin-bottom: 8px;
      // text-transform: uppercase;
    }

    .error-description {
      @include type-caption();
    }
  }

  .publish-warning {
    border-bottom: 1px solid $divider-color;
    display: flex;
    flex-direction: column;
    padding: 16px;

    &:first-of-type {
      padding-top: 0;
    }

    .warning-label {
      @include type-subheading();

      color: $md-orange;
      // font-weight: bold;
      margin-bottom: 8px;
      // text-transform: uppercase;
    }

    .warning-description {
      @include type-caption();
    }
  }
</style>

<template>
  <div class="health-drawer">
    <div v-if="isValid" class="publish-valid">
      <span class="valid-label">Checks pass!</span>
      <span class="valid-description">This is good to publish.</span>
    </div>

    <div v-for="error in errors" class="publish-error">
      <span class="error-label">{{ error.label }}</span>
      <span class="error-description">{{ error.description }}</span>
      <span class="validation-info">Go To Components</span>
      <ul class="validation-items">
        <li v-for="item in error.items" class="validation-item">
          <span class="validation-item-location" :class="{ 'validation-item-link': item.uri && item.field }" @click.stop="openLocation(item.uri, item.path, item.location)">{{ item.location }}</span> <span v-if="item.preview" class="validation-item-preview">{{ item.preview }}</span>
        </li>
      </ul>
    </div>

    <div v-for="warning in warnings" class="publish-warning">
      <span class="warning-label">{{ warning.label }}</span>
      <span class="warning-description">{{ warning.description }}</span>
      <span class="validation-info">Go To Components</span>
      <ul class="validation-items">
        <li v-for="item in warning.items" class="validation-item">
          <span class="validation-item-location" :class="{ 'validation-item-link': item.uri && item.field }" @click.stop="openLocation(item.uri, item.path, item.location)">{{ item.location }}</span> <span v-if="item.preview" class="validation-item-preview">{{ item.preview }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>


<script>
  import { mapState } from 'vuex';
  import { getFieldEl, getComponentEl } from '../utils/component-elements';
  import UiIcon from 'keen/UiIcon';

  export default {
    data() {
      return {};
    },
    computed: mapState({
      errors: (state) => state.validation.errors,
      warnings: (state) => state.validation.warnings,
      hasErrors() {
        return this.errors.length > 0;
      },
      hasWarnings() {
        return this.warnings.length > 0;
      },
      isValid() {
        return !this.hasErrors && !this.hasWarnings;
      }
    }),
    methods: {
      openLocation(uri, path, location) {
        const el = getFieldEl(uri, path),
          componentEl = el && getComponentEl(el);

        this.$store.commit('OPEN_VALIDATION_LINK', location);
        if (componentEl) {
          // component exists and is in the body (not a head component)
          this.$store.dispatch('select', componentEl);
        }
        this.$store.dispatch('focus', { uri, path, el });
      }
    },
    components: {
      UiIcon
    }
  };
</script>
