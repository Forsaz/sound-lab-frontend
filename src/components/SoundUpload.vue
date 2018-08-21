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
              <v-btn flat @click="$refs.fileInput.click()">Add Files</v-btn>
              <v-btn flat @click="startUpload" :loading="uploading">Upload</v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <div style="height: 60px;"></div>
          <v-card-text>


            <v-container grid-list-md fluid text-xs-center>
              <v-layout row wrap>
                <v-flex xs6>
                  <v-list subheader>
                    <v-subheader>Progress</v-subheader>

                    <v-list-tile avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>Simultaneous uploads: <b>{{simultaneousUploads}}</b></v-list-tile-title>
                        <v-list-tile-sub-title>
                            <v-slider
                              v-model="simultaneousUploads"
                              max="10"
                              min="0"
                            ></v-slider>
                        </v-list-tile-sub-title>
                        <v-list-tile-sub-title>

                        </v-list-tile-sub-title>
                      </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>Uploading files {{ uploadedCount }} out of {{ files.length }}</v-list-tile-title>
                        <v-list-tile-sub-title><v-progress-linear v-model="filesProgress" height="15"></v-progress-linear></v-list-tile-sub-title>
                      </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>Uploading bytes {{ uploadedBytes | filesize }} out of {{ allBytes | filesize }}</v-list-tile-title>
                        <v-list-tile-sub-title><v-progress-linear v-model="bytesProgress" height="15"></v-progress-linear></v-list-tile-sub-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                </v-flex>

                <v-flex xs6>
                  <v-list subheader>
                    <v-subheader></v-subheader>

                    <v-list-tile avatar>
                      <v-list-tile-avatar></v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>Uploaded Files</v-list-tile-title>
                        <v-list-tile-sub-title>{{completedFilesCount}}</v-list-tile-sub-title>
                      </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile avatar>
                      <v-list-tile-avatar>
                        <v-icon v-show="failedFilesCount > 0">error</v-icon>
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>Failed Files</v-list-tile-title>
                        <v-list-tile-sub-title>{{failedFilesCount}}</v-list-tile-sub-title>
                      </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile avatar>
                      <v-list-tile-avatar>
                        <v-icon v-show="cancelledFilesCount > 0">error</v-icon>
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>Cancelled Files</v-list-tile-title>
                        <v-list-tile-sub-title>{{cancelledFilesCount}}</v-list-tile-sub-title>
                      </v-list-tile-content>
                    </v-list-tile>

                  </v-list>
                </v-flex>
              </v-layout>
            </v-container>
            
            

            <v-subheader>
              File List
            </v-subheader>

            <v-toolbar floating color="amber">
              <v-menu offset-y>
                <v-btn slot="activator" flat>Clear Files</v-btn>

                <v-list>
                  <v-list-tile @click="files = []"><v-list-tile-title>Clear All Files</v-list-tile-title></v-list-tile>
                  <v-list-tile @click="clearCompleted"><v-list-tile-title>Clear Completed Files</v-list-tile-title></v-list-tile>
                </v-list>
              </v-menu>
              <v-btn flat @click.native="cancel">Cancel Uncompleted</v-btn>
              <v-btn flat :loading="uploading" @click="retry">Retry</v-btn>
            </v-toolbar>
            <v-list>
              <v-list-tile v-for="(file, index) in files" :key="index">
                <v-list-tile-avatar>
                  <v-icon v-show="file.status === 'queued'">queue_music</v-icon>
                  <v-progress-circular :title="`${file.progress} %`" v-show="file.status === 'uploading'" :value="file.progress"></v-progress-circular>
                  <v-icon v-show="file.status === 'done'" title="Done">done</v-icon>
                  <v-icon v-show="file.status === 'cancelled'" title="Cancelled">not_interested</v-icon>
                  <v-icon v-show="file.status === 'error'" :title="file.error">error</v-icon>
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
import _ from 'underscore'

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
      uploading: false,
      uploadsInProgress: 0,
      uploadedBytes: 0,
      simultaneousUploads: 3
    }
  },

  computed: {
    ...mapState('activestorage', ['rails_direct_uploads_url']),
    ...mapState('auth', ['token']),

    allBytes() {
      return this.files.map((f) => f.inputFile.size).reduce((a, b) => a + b, 0)
    },

    uploadedCount() {
      return this.files.filter((f) => f.status !== 'queued').length
    },

    filesProgress() {
      return Math.round(this.uploadedCount * 100 / this.files.length)
    },

    bytesProgress() {
      return Math.round(this.uploadedBytes * 100 / this.allBytes)
    },

    completedFilesCount () {
      return this.files.filter(file => file.status === 'done').length
    },

    failedFilesCount () {
      return this.files.filter(file => file.status === 'error').length
    },

    cancelledFilesCount () {
      return this.files.filter(file => file.status === 'cancelled').length
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
          error: null,
          inputFile: inputFile
        })
      }
    },

    startUpload () {
      this.uploadedBytes = 0
      this.uploading = true
      this.upload()
    },

    upload () {
      for(const [index, file] of this.files.entries()) {
        if (this.uploadsInProgress >= this.simultaneousUploads) break
        if (file.status !== 'queued') continue
        let promise = this.uploadFile(file)
        promise.then(() => {
          file.status = 'done'
          this.finnishUpload(file)
        }).catch(() => {
          this.finnishUpload(file)
        })
      }
      if (this.uploadsInProgress == 0) this.uploading = false
    },

    uploadFile(file) {
      this.uploadsInProgress = this.uploadsInProgress + 1
      file.status = 'uploading'

      let that = this

      const delegate = {
        directUploadWillCreateBlobWithXHR(xhr) {
          xhr.setRequestHeader("Authorization", `Bearer ${that.token}`)
        },
        directUploadWillStoreFileWithXHR(xhr) {
          xhr.setRequestHeader("Authorization", `Bearer ${that.token}`)
          let throttledProgress = _.throttle((event) => that.fileUploadDidProgress(file, event), 1000)
          xhr.upload.addEventListener("progress", throttledProgress)
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

    finnishUpload(file) {
      this.uploadsInProgress = this.uploadsInProgress - 1
      this.upload()
      if (this.uploadsInProgress == 0) this.uploading = false
    },

    fileUploadDidProgress (file, progressEvent) {
      const addedBytes = progressEvent.loaded - file.uploaded
      this.uploadedBytes = this.uploadedBytes + addedBytes
      file.uploaded = progressEvent.loaded
      file.progress = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
    },

    removeFile(index) {
      this.files.splice(index, 1)
    },

    clearCompleted() {
      console.log('Clearing files', this.files.length, this.files)
      let filesToRemove = this.files.filter((file) => file.status == 'done')
      for(let file of filesToRemove) {
        let index = this.files.indexOf(file)
        this.removeFile(index)
      }
    },

    retry () {
      this.files.forEach((file) => {
        if (file.status === 'error' || file.status === 'cancelled') file.status = 'queued'
      })
      this.startUpload()
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
