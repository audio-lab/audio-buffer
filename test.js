var AudioBuffer = require('./');
var Speaker = require('audio-speaker');
var assert = require('assert');
var now = require('performance-now');
var pcm = require('pcm-util');
var extend = require('xtend/mutable');
var stream = require('stream');
var b2ab = require('buffer-to-arraybuffer');
var ab2b = require('arraybuffer-to-buffer');


describe('Format', function () {
	it.only('Interleaved array', function () {
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

	it('Change format in runtime');

	it('Buffer int', function () {
		var data = new Buffer(8*2);
		data.writeInt16LE(32767, 0);
		data.writeInt16LE(-32767, 2);
		data.writeInt16LE(0, 4);
		data.writeInt16LE(12000, 6);

		var buffer = AudioBuffer(data);

		assert.deepEqual(buffer.get(0, 0), 32767);
		assert.deepEqual(buffer.get(0, 1), 0);
		assert.deepEqual(buffer.get(1, 0), -32767);
		assert.deepEqual(buffer.get(1, 1), 12000);

	});

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

	it('Create from AudioBuffer', function () {
		var a1 = AudioBuffer([1,2,3,4]);
		var a2 = AudioBuffer(a1);

		var a3 = AudioBuffer(a1, {float: true});

		assert.notEqual(a1, a2);
		assert.notEqual(a1, a3);
		assert.notEqual(a1.format, a2.format);
		assert.notEqual(a1.format, a3.format);

		assert.deepEqual(a1.format, a2.format);


		assert.deepEqual(a3.format, pcm.normalizeFormat(extend(pcm.getFormat(pcm.defaultFormat), {float: true})));
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
	it('Fill', function () {
		var a = AudioBuffer([1,2,3,4]);
		a.fill(1);

		assert.deepEqual(a.toArray(), [1,1,1,1]);

		a.fill(function (channel, offset) { return channel + offset });

		assert.deepEqual(a.toArray(), [0,1,1,2]);
	});

	it('toArray', function () {
		var a = AudioBuffer(4, {interleaved: true});

		a.set(0,0,10);
		a.set(1,0,20);
		a.set(0,1,30);
		a.set(1,1,40);

		assert.deepEqual(a.getChannelData(0), [10, 30]);
		assert.deepEqual(a.getChannelData(1), [20, 40]);
		assert.deepEqual(a.toArray(), [10, 20, 30, 40]);

		//TODO: ponder on this
		// a.interleaved = false;
		// assert.deepEqual(a.toArray(), [10, 20, 30, 40]);
	});
});


describe('NDArray comapatability', function () {

});


describe('AudioBuffer comapatability', function () {

});