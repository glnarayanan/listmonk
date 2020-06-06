<template>
  <div>
    <b-modal scroll="keep" @close="close"
      :aria-modal="true" :active.sync="visible" :width="1200">
      <div>
        <div class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <h4>{{ data.name }}</h4>
          </header>
        </div>
        <section expanded class="modal-card-body preview">
          <b-loading :active.sync="isLoading" :is-full-page="false"></b-loading>
          <form v-if="body" method="post" :action="previewURL" target="iframe">
            <input type="hidden" name="body" :value="body" />
          </form>

          <iframe id="iframe" ref="iframe"
            title="data.name"
            :src="body ? 'about:blank' : previewURL"
            @load="onLoaded"
          ></iframe>
        </section>
        <footer class="modal-card-foot has-text-right">
          <b-button @click="close">Close</b-button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { uris } from '../constants';

export default {
  name: 'CampaignPreview',

  props: {
    // Data is either a campaign object or a template object.
    data: Object,

    // campaign | template.
    type: String,
    body: String,
  },

  data() {
    return {
      visible: true,
      isLoading: true,
    };
  },

  methods: {
    close() {
      this.$emit('close');
      this.visible = false;
    },

    // On iframe load, kill the spinner.
    onLoaded() {
      this.isLoading = false;
    },
  },

  computed: {
    previewURL() {
      let uri = 'about:blank';

      if (this.type === 'campaign') {
        uri = uris.previewCampaign;
      } else if (this.type === 'template') {
        uri = uris.previewTemplate;
      }

      return uri.replace(':id', this.data.id);
    },
  },

  mounted() {
  },
};
</script>
