<template>
  <div>
    <v-btn color="green" dark small @click="openDialog"> 
      <v-icon left>cloud_upload</v-icon> Sound Uploader 
      <div v-if="uploadedCount > 0">
        &nbsp;&nbsp;&nbsp;
        {{uploadedCount}} / {{files.length}}
      </div>
    </v-btn>

    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card v-if="dialog">
          <v-toolbar color="amber" fixed>
            <v-btn icon @click.native="dialog = false">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Uploader</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <input v-show="false" type="file" multiple id="file" ref="fileInput" @change="loadFiles">
              <v-btn flat @click.native="$refs.fileInput.click()">Add Files</v-btn>
              <v-btn flat @click.native="upload">Upload</v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <div style="height: 60px;"></div>
          <v-card-text>
            <v-subheader>Progress</v-subheader>

            <v-container grid-list-md text-xs-center>
              <v-layout row>
                <v-flex xl6>
                  <v-progress-linear v-model="filesProgress" height="15"></v-progress-linear>
                </v-flex>

                <v-flex xl6>
                  <p>Uploading files {{ uploadedCount }} out of {{ files.length }}</p>
                </v-flex>
              </v-layout>

              <v-layout row>
                <v-flex xl6>
                   <v-progress-linear v-model="bytesProgress" height="15"></v-progress-linear>
                </v-flex>

                <v-flex xl6>
                  Uploading bytes {{ uploadedBytes }} out of {{ allBytes }}
                </v-flex>
              </v-layout>
            </v-container>

            <v-subheader>
              File List
            </v-subheader>
            <v-btn color="warning" @click.native="files = []">Clear Files</v-btn>
            <v-btn color="error" dark @click.native="cancel">Cancel</v-btn>
            <v-list>
              <v-list-tile v-for="(file, index) in files" :key="index">
                <v-list-tile-avatar>
                  <v-icon v-show="file.status === 'queued'">queue_music</v-icon>
                  <v-progress-circular :title="`${file.progress} %`"v-show="file.status === 'uploading'" :value="file.progress"></v-progress-circular>
                  <v-icon v-show="file.status === 'done'" title="Done">done</v-icon>
                  <v-icon v-show="file.status === 'cancelled'" title="Cancelled">not_interested</v-icon>
                  <v-icon v-show="file.status === 'error'" title="Error">error</v-icon>
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title>{{ file.name }}</v-list-tile-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-btn icon class="mx-0" @click="removeFile(index)">
                    <v-icon>delete</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
</template>

<script>
import {mapActions, mapState} from 'vuex'
import { DirectUpload } from "activestorage"

const UPLOAD_QUEUE_SIZE = 3
const STATUS_QUEUED = 'queued'
const STATUS_UPLOADING = 'uploading'
const STATUS_DONE = 'done'
const STATUS_ERROR = 'error'
const STATUS_CANCELLED = 'cancelled'

export default {
  props: ['hiveId'],

  data() {
    return {
      dialog: false,
      files: [],
      uploadsInProgress: 0
    }
  },

  computed: {
    ...mapState('activestorage', ['rails_direct_uploads_url']),
    ...mapState('auth', ['token']),

    allBytes() {
      return this.files.map((f) => f.inputFile.size).reduce((a, b) => a + b, 0)
    },

    uploadedBytes() {
      return this.files.map((f) => f.uploaded).reduce((a, b) => a + b, 0)
    },

    uploadedCount() {
      return this.files.filter((f) => f.status !== 'queued').length
    },

    filesProgress() {
      return Math.round(this.uploadedCount * 100 / this.files.length)
    },

    bytesProgress() {
      return Math.round(this.uploadedBytes * 100 / this.allBytes)
    }
  },

  methods: {
    ...mapActions('hive', ['createSound']),

    loadFiles(event) {
      const inputFiles = event.target.files;

      for(let i = 0; i < inputFiles.length; i++) {
        const inputFile = inputFiles.item(i)
        this.files.push({
          name: inputFile.name,
          progress: 0,
          uploaded: 0,
          status: 'queued',
          inputFile: inputFile
        })
      }
    },

    upload () {
      for(const [index, file] of this.files.entries()) {
        if (this.uploadsInProgress >= UPLOAD_QUEUE_SIZE) break
        if (file.status !== 'queued') continue
        let promise = this.uploadFile(file, index)
        promise.then(() => this.finnishUpload(index))
      }
    },

    uploadFile(file, index) {
      this.uploadsInProgress = this.uploadsInProgress + 1
      file.status = 'uploading'

      let that = this

      const delegate = {
        directUploadWillCreateBlobWithXHR(xhr) {
          xhr.setRequestHeader("Authorization", `Bearer ${that.token}`)
        },
        directUploadWillStoreFileWithXHR(xhr) {
          xhr.setRequestHeader("Authorization", `Bearer ${that.token}`)
          xhr.upload.addEventListener("progress", (event) => { that.fileUploadDidProgress(index, event) })
        }
      }

      const upload = new DirectUpload(file.inputFile, this.rails_direct_uploads_url, delegate)

      return new Promise((resolve, reject) => {
        try {
          upload.create((error, blob) => {
            if(error) {
              file.status = 'error'
              reject()
            } else {
              resolve(blob)
            }
          });
        } catch(e) {
          console.log(e);
          reject()
        }
        
      }).then((blob) => {
        this.createSound(blob.signed_id)
      })
    },

    finnishUpload(index) {
      console.log('done ', index, this.files[index])
      this.files[index].status = 'done'
      this.uploadsInProgress = this.uploadsInProgress - 1
      this.upload()
    },

    fileUploadDidProgress (index, progressEvent) {
      this.files[index].uploaded =progressEvent.loaded
      this.files[index].progress = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
    },

    removeFile(index) {
      this.files.splice(index, 1)
    },

    openDialog() {
      this.dialog = true
    },
    
    close () {
      this.dialog = false
    },

    cancel () {
      for(const file of this.files) {
        if (file.status !== 'queued') continue
        file.status = 'cancelled'
      }
    }
  }
}
</script>
