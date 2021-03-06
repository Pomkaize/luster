/* globals sinon,assert,describe,it,beforeEach,afterEach */
'use strict';
var ClusterProcess = require('../../../lib/cluster_process'),
    Configuration = require('../../../lib/configuration'),
    fixturesConf = require('../fixtures/luster.conf'),
    extend = require('extend'),
    TestClusterProcess;

/**
 * ClusterProcess is an abstract class, it cannot be instantiated for tests;
 * TestClusterProcess is a smalles possible descendant of ClusterProcess;
 */
TestClusterProcess = ClusterProcess.create(function TestClusterProcess() {});
TestClusterProcess.prototype._setupIPCMessagesHandler = function() {};

describe('ClusterProcess', function() {
    var clusterProcess,
        sandbox = sinon.sandbox.create();

    afterEach(function() {
        sandbox.restore();
    });

    describe('configure', function() {
        var config;

        beforeEach(function () {
            clusterProcess = new TestClusterProcess();
            config = extend({}, fixturesConf, true);
            clusterProcess.addListener('error', function () {});
        });

        afterEach(function () {
            clusterProcess.removeAllListeners('error');
        });

        it('should emit "configured" event on configuration success', function () {
            var spy = sandbox.spy();

            clusterProcess.on('configured', spy);
            clusterProcess.configure(config);

            assert.calledOnce(spy);
        });

        it('should emit "error" event for malformed config', function () {
            var spy = sandbox.spy();

            clusterProcess.on('error', spy);
            clusterProcess.configure({});

            assert.calledOnce(spy);
        });

        it('should not apply env config if overriding is explicitly turned off', function() {
            process.env.LUSTER_CONF = 'workers=1';

            clusterProcess.configure(config, false);

            assert.strictEqual(clusterProcess.config.get('workers'), 10);
        });

        it('should run checkConfiguration after applyEnv', function() {
            var applyEnv = sandbox.spy(Configuration, 'applyEnvironment'),
                check = sandbox.spy(Configuration, 'check');
            clusterProcess.configure(config);
            assert(check.calledAfter(applyEnv));
        });
    });
});
