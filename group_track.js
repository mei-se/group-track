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
	constructor(map, leaflet, list) {
		this.allLinks = [];
		this.map = map;
		this.colorIndex = 0;
		this.colors = ["red", "green", "blue", "orange"];
		this.leaflet = leaflet;
		this.list = document.createElement("ol");//list;
		this.addLegend(leaflet, map);
	}

	add(name, url) {
		console.log("Adding "+url);
		var found = this.allLinks.findIndex((elem) => elem.link === url || elem.name === name);
		
		if(found != -1) {
			console.log(url + " or "+name+" already in the list, not adding");
			return;
		}
		
		var color = this.colors[this.colorIndex];
		this.colorIndex = (this.colorIndex + 1) % this.colors.length;
		var track = new ActivityTrack(name, url, color);
		this.allLinks.push(track);
		this.addToList(name, url, color);
	}

	addToList(name, url, color) {
		var item = document.createElement("li");
		item.id = this.makeId(name, url);
		var strong = document.createElement("b");
		var value = document.createTextNode(name);
		strong.appendChild(value);
        item.appendChild(strong);
		item.style.color = color;
		var deleteButton = document.createElement("button");
		deleteButton.value = "X";
		deleteButton.appendChild(document.createTextNode("X"));
		deleteButton.addEventListener("click", () => removeTrackingLink(name, url), false);
		item.append(deleteButton);
        this.list.appendChild(item);
	}

	makeId(name, url) {
		return name+":"+url;
	}

	remove(name, url) {
		this.allLinks = this.allLinks.filter((elem) => !(elem.link === url && elem.name === name));
		document.getElementById(this.makeId(name,url)).remove();
	}
		
		
	updatePositions() {
		console.log("updating positions");
		this.allLinks.forEach((link) => link.updateOn(this.leaflet, this.map));
	}

	addLegend(leaflet, map) {
		var legend = leaflet.control({ position: "bottomleft" });
		var self = this;
		legend.onAdd = function(map) {
			var div = leaflet.DomUtil.create("div", "legend");
			div.appendChild(self.list);			
			return div;
		};
		legend.addTo(map);
	}
}
