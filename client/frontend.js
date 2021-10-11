import Vue from "https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.esm.browser.js";
google.maps.event.addDomListener(window, "load", init);

Vue.component("loader", {
  template: `
  <div style="display: flex; justify-content: center; align-items: center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  `,
});

Vue.component("field", {
  template: `
  <div >
    <label for="point"  class="mr-3">Point {{point.length}}</label>
    <input type="text" class="form-control" id="lat1" v-model="point[point.length - 1].lat" placeholder="lat 1">
    <input type="text" class="form-control" id="lon1" v-model="point[point.length - 1].lng"  placeholder="lon 1">
  </div>
  `,
  props: ["point"],
});

const vueData = new Vue({
  el: "#app",
  data() {
    return {
      loading: false,
      showField: false,
      manualPoint: [
        { lat: "", lng: "" },
        { lat: "", lng: "" },
      ],
      points: [],
      choosePoints: [],
    };
  },
  computed: {
    canCreateManual() {
      return this.manualPoint[0].lat && this.manualPoint[1].lng 
    },
    canCreateChoosePoint() {
      return this.choosePoints.length > 1
    }
  },
  methods: {
    async calcDistance() {
      let { ...coordinate } = this.choosePoints;
      const newPoint = await request("/api/points", "POST", coordinate);
      this.points.push(newPoint);
      this.choosePoints = [];
      removeMarkers();
    },

    async calcDistanceManual() {
      let { ...coordinate } = this.manualPoint;
      const newPoint = await request("/api/points", "POST", coordinate);
      this.points.push(newPoint);
      this.manualPoint = [
        { lat: "", lng: "" },
        { lat: "", lng: "" },
      ];
    },

    addField() {
      let point = { lat: "", lng: "" };
      this.manualPoint.push(point);
    },

    async deletePoint(id) {
      await request(`/api/points/${id}`, "DELETE");
      this.points = this.points.filter((point) => point.id !== id);
    },

    showFieldEnter() {
      this.showField = !this.showField;
    },
  },
  async mounted() {
    this.loading = true;
    this.points = await request("/api/points");
    this.loading = false;
  },
});

let POINTS = [];
let markers = [];


function init() {
  const myLatlng = { lat: 46.479457, lng: 30.732406 };
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
    center: myLatlng,
  });

  let infoWindow = new google.maps.InfoWindow({
    content: "Click the map to get Lat/Lng!",
    position: myLatlng,
  });

  map.addListener("click", (mapsMouseEvent) => {
    infoWindow = new google.maps.InfoWindow({
      position: mapsMouseEvent.latLng,
    });

    POINTS = vueData.choosePoints;
    POINTS.push(mapsMouseEvent.latLng.toJSON());
    let i = POINTS.length;
    const marker = new google.maps.Marker({
      position: mapsMouseEvent.latLng.toJSON(),
      label: String(i),
      map,
      title: "point",
    });
    markers.push(marker);
  });
}

function removeMarkers() {
  for (var inx = 0; inx < markers.length; inx++) {
    markers[inx].setMap(null);
  }
  markers = new Array();
}

async function request(url, method = "GET", data = null) {
  try {
    const headers = {};
    let body;

    if (data) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }
    const response = await fetch(url, {
      method,
      headers,
      body,
    });
    return await response.json();
  } catch (e) {
    console.warn("Error:", e.message);
  }
}
