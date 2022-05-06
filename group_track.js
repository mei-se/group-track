class ActivityTrack {
	constructor(name, link, color) {
		this.name = name;
		this.link = link;
		this.color = color;
		this.lat = 0;
		this.lon = 0;
	}

	updateOn(leaflet, map) {
		var xhr = new XMLHttpRequest();
		var self = this;

        xhr.open("GET", this.link, true);
		
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var json = JSON.parse(this.responseText);
				self.draw(leaflet, map, json);
			}
        };
		xhr.send();
	}

	draw(leaflet, map, json) {
		var oldLat = this.lat;
		var oldLon = this.lon;
		this.lat = json.session.position.lat;
		this.lon = json.session.position.lon;
		if (oldLat == 0 && oldLon == 0) {
			map.setView([this.lat, this.lon], 13);
			return;
		}	
		leaflet.polyline([[oldLat, oldLon], [this.lat, this.lon]], {color: this.color}).addTo(map);
	}
}

class TrackCollection {
	constructor(map, leaflet) {
		this.allLinks = [];
		this.map = map;
		this.colors = ["red", "green", "blue", "orange"];
		this.leaflet = leaflet;
	}

	add(name, url) {
		console.log("Adding "+url);
		var findResult = this.allLinks.findIndex((elem) => elem.link === url); 
		if(findResult != -1) {
			console.log(url + " already in the list, not adding, result was "+findResult);
			return;
		}
		var color = this.colors[this.allLinks.length];
		var track = new ActivityTrack(name, url, color);
		this.allLinks.push(track);
	}

	updatePositions() {
		console.log("updating positions");
		this.allLinks.forEach((link) => link.updateOn(this.leaflet, this.map));
	}
}
