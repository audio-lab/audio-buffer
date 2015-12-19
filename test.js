var AudioBuffer = require('./');
var Speaker = require('audio-speaker');
var assert = require('assert');
var now = require('performance-now');


describe('Format', function () {
	it('Interleaved array', function () {
		var buffer = new AudioBuffer([
			0, 1, 0, 1, 0, 1
		], {channels: 2, interleaved: true});

		// assert.deepEqual(buffer, [0,1,0,1]);
		assert.deepEqual(buffer.getChannelData(0), [0, 0, 0]);
		assert.deepEqual(buffer.getChannelData(1), [1, 1, 1]);
	});
	it('Planar array', function () {
		var buffer = new AudioBuffer([
			0, 1, 0, 1, 0, 1, 0, 1, 0
		], {channels: 3, interleaved: false});

		// assert.deepEqual(buffer, [0,1,0,1]);
		assert.deepEqual(buffer.getChannelData(0), [0, 1, 0]);
		assert.deepEqual(buffer.getChannelData(1), [1, 0, 1]);
		assert.deepEqual(buffer.getChannelData(2), [0, 1, 0]);
	});
	it('Change format in runtime')
});


describe('Creation', function () {
	it('Buffer float', function () {
		var data = new Buffer(8*3);
		data.writeFloatLE(1.0, 0);
		data.writeFloatLE(-1.0, 4);
		data.writeFloatLE(0.5, 8);
		data.writeFloatLE(-0.5, 12);
		data.writeFloatLE(-1, 16);
		data.writeFloatLE(0.5, 20);

		var buffer = AudioBuffer(data, {
			float: true,
			channels: 3
		});

		//interleaved case
		assert.deepEqual(buffer.getChannelData(0), [1, -0.5]);
		assert.deepEqual(buffer.getChannelData(1), [-1, -1]);
		assert.deepEqual(buffer.getChannelData(2), [0.5, 0.5]);

		//planar
		buffer.interleaved = false;
		assert.deepEqual(buffer.getChannelData(0), [1, -1.0]);
		assert.deepEqual(buffer.getChannelData(1), [0.5, -0.5]);
		assert.deepEqual(buffer.getChannelData(2), [-1, 0.5]);
	});

});


describe('Accessors', function () {
	it('get/set', function () {
		var buffer = new AudioBuffer(Array(4));

		assert.equal(buffer.get(1, 1), 0);

		buffer.set(0, 0, 1);
		buffer.set(1, 0, -1);
		buffer.set(0, 1, 1);
		buffer.set(1, 1, -1);

		assert.equal(buffer.get(0, 0), 1);
		assert.equal(buffer.get(1, 0), -1);
		assert.equal(buffer.get(0, 1), 1);
		assert.equal(buffer.get(1, 1), -1);
	});
});


describe('Array methods', function () {

});


describe('NDArray comapatability', function () {

});


describe('AudioBuffer comapatability', function () {

});


describe('Performance', function () {
	it.skip('NDData accessor vs class', function () {
		function Accessor (data) {
			this.data = data;
			this.length = data[0].length;
		};
		Accessor.prototype.get = function (channel, offset) {
			return this.data[channel, offset];
		};
		Accessor.prototype.set = function (channel, offset, value) {
			this.data[channel, offset] = value;
		};

		//class accessor
		var start = now();
		var data = [[1,2],[3,4]];
		var accessor = new Accessor(data);
		for (var i = 0; i < 1000000; i++) {
			accessor.set(i%2, (i+1)%2, accessor.get((i+1)%2, i%2));
			accessor.length;
		}
		console.log(now() - start);

		//object accessor
		var start = now();
		var data = [[1,2],[3,4]];
		var accessor = {
			get: function (channel, offset) {
				return data[channel, offset];
			},
			set: function (channel, offset, value) {
				data[channel, offset] = value;
			},
			length: data[0].length
		};
		for (var i = 0; i < 1000000; i++) {
			accessor.set(i%2, (i+1)%2, accessor.get((i+1)%2, i%2));
			accessor.length;
		}
		console.log(now() - start);

		//simple array access
		var start = now();
		var data = [[1,2],[3,4]];
		for (var i = 0; i < 1000000; i++) {
			if (i%2) {
				data[i%2][(i+1)%2] = data[(i+1)%2][i%2];
				data.length;
			} else {
				data[(i+1)%2][i%2] = data[i%2][(i+1)%2];
				data.length;
			}
		}
		console.log(now() - start);

		//Results
		//object accessor is ~4.5 faster for creating
		//but ~10% slower for accessing
		//all accessors ~2-3 times slower than array access


	});
});