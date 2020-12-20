import { GLTFLoader } from "https://threejs.org/examples/jsm/loaders/GLTFLoader.js";
import * as ENGINE from "./src/engine.js";

ENGINE.createComponent(
	"CameraController",
	class {
		start() {
			this.direction = new ENGINE.Vector3();
			this.input = this.entity.scene.app.input;
			this.entity.rotation.order = "YXZ";
			this.ball = this.entity.scene.find("ball");

			window.addEventListener("mousedown", () => {
				this.entity.scene.app.canvas.requestPointerLock();
			});
			this.ball.addEventListener("collisionenter", function (c) {
				console.log(c);
			});
		}
		update() {
			const ball = this.ball;
			if (this.input.getKeyDown("KeyG")) {
				console.log(ball.getComponent("Joint")._ref.getLocalAxis1());
				ball.getComponent("Joint").anchor = new ENGINE.Vector3(
					0,
					0,
					-10
				);
			}

			if (this.input.getKeyDown("ArrowUp")) {
				ball.getComponent("Rigidbody").applyForceToCenter(
					new ENGINE.Vector3(0, 0, -200)
				);
			}
			if (this.input.getKeyDown("ArrowDown")) {
				ball.getComponent("Rigidbody").applyForceToCenter(
					new ENGINE.Vector3(0, 0, 200)
				);
			}
			if (this.input.getKeyDown("ArrowLeft")) {
				ball.getComponent("Rigidbody").applyForceToCenter(
					new ENGINE.Vector3(-200, 0, 0)
				);
			}
			if (this.input.getKeyDown("ArrowRight")) {
				ball.getComponent("Rigidbody").applyForceToCenter(
					new ENGINE.Vector3(200, 0, 0)
				);
			}

			if (this.input.getKey("KeyW")) {
				this.entity.translateZ(-0.1);
			}
			if (this.input.getKey("KeyS")) {
				this.entity.translateZ(0.1);
			}
			if (this.input.getKey("KeyA")) {
				this.entity.translateX(-0.1);
			}
			if (this.input.getKey("KeyD")) {
				this.entity.translateX(0.1);
			}
			if (this.input.getKey("Space")) {
				this.entity.translateY(0.1);
			}
			if (this.input.getKey("ShiftLeft")) {
				this.entity.translateY(-0.1);
			}
			this.entity.rotation.x -= this.input.mouseDelta.y * 0.001;
			this.entity.rotation.y -= this.input.mouseDelta.x * 0.001;
		}
	}
);

let entity, geo, mat, mesh;

const loader = new GLTFLoader();
const app = new ENGINE.Application("c");

app.scene.background = new ENGINE.Color("skyblue");
console.log(app.scene);

// lighting

entity = new ENGINE.Entity();
const hemiLight = entity.addComponent("HemisphereLight", {
	color: 0xffffff,
	groundColor: 0xffffff,
	intensity: 0.6,
});

hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);

entity.position.set(0, 100, 0);

entity = new ENGINE.Entity();
const dirLight = entity.addComponent("DirectionalLight", {
	color: 0xffffff,
	intensity: 1,
});

dirLight.color.setHSL(0.1, 1, 0.95);

dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

const d = 50;

dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;

dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = -0.0001;

entity.position.set(-100, 175, 100);

// floor
geo = new ENGINE.PlaneBufferGeometry(200, 200);
mat = new ENGINE.MeshPhongMaterial({
	color: 0x718e3e,
});
mesh = new ENGINE.Mesh(geo, mat);
mesh.receiveShadow = true;

entity = new ENGINE.Entity("floor");
entity.addComponent("Renderable", mesh);
entity.addComponent("Collider", {
	type: "box",
	halfExtents: new ENGINE.Vector3(100, 100, 0.1),
});
entity.rotation.set(-Math.PI / 2, 0, 0);

new ENGINE.Entity().addComponent(
	"Renderable",
	new ENGINE.GridHelper(200, 200, 0x0000ff, 0x808080)
);

// ball
geo = new ENGINE.SphereGeometry(1, 32, 32);
mat = new ENGINE.MeshPhongMaterial({ color: 0xffff00 });
mesh = new ENGINE.Mesh(geo, mat);
entity = new ENGINE.Entity("ball");
entity.addComponent("Renderable", mesh);
entity.position.set(0, 5, 2);
entity.addComponent("Rigidbody");
entity.addComponent("Joint", {
	type: "prismatic",
	linkedEntity: app.scene.find("floor"),
	anchor: new ENGINE.Vector3(0, 10, 0),
});
entity.addComponent("Collider", {
	type: "sphere",
	radius: 1,
});

// blocks
const position = new ENGINE.Vector3(-10, 1, -5);
geo = new ENGINE.BoxBufferGeometry(1, 1, 1);
mat = new ENGINE.MeshPhongMaterial({ color: 0x2194ce });
for (let k = 0; k < 4; k++) {
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 20; j++) {
			entity = new ENGINE.Entity();
			mesh = new ENGINE.Mesh(geo, mat);
			entity.addComponent("Renderable", mesh);
			entity.position.copy(position);
			entity.addComponent("Collider", {
				type: "box",
				halfExtents: new ENGINE.Vector3(0.5, 0.5, 0.5),
			});
			entity.addComponent("Rigidbody", { mass: 0.1 });
			position.x += 1;
		}
		position.y += 1;
		position.x = -10;
	}
	position.y = 1;
	position.z += 1;
}

// camera
entity = new ENGINE.Entity("camera");
entity.addComponent("PerspectiveCamera");
entity.addComponent("CameraController");
entity.position.set(0, 5, 10);

app.start();
