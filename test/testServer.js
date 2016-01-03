'use strict';

const Rx = require('rx');
const rxCouch = require('../lib/server');
const expect = require('chai').expect;

//------------------------------------------------------------------------------

const expectOneResult = function (observable, done, match) {

  var didSendData = false;
  var failure;

  observable.subscribe(

    function (value) {
      try {
        if (didSendData && !failure)
          failure = new Error("Unexpected second result: ", value);
        else
          match(value);
      }
      catch (err) {
        failure = err;
      }
    },

    function (err) {
      done(err);
    },

    function () {
      done(failure);
    });

};

//------------------------------------------------------------------------------

const expectOnlyError = function (observable, done, match) {

  var didSendData = false;
  var failure;

  observable.subscribe(

    function (value) {
      if (!failure)
        failure = new Error("onNext was called with value: ", value);
    },

    function (err) {
      if (!failure) {
        try {
          if (match)
            match(err);
        }
        catch (err) {
          failure = err;
        }
      }
      done(failure);
    },

    function () {
      done(new Error("onCompleted was called"));
    });

};

//------------------------------------------------------------------------------

describe('rx-couch', function () {

  it('should be defined', function () {

    expect(rxCouch).to.be.a('function');

  });

  //----------------------------------------------------------------------------

  it('should fail for malformed URL', function () {

    const badIdea = function () {
      return new rxCouch('not a valid URL');
    };

    expect(badIdea).to.throw();

  });

  //----------------------------------------------------------------------------

  it('should fail for URL containing a database path', function () {

    const badIdea = function () {
      return new rxCouch('http://localhost:5984/some_db');
    };

    expect(badIdea).to.throw();

  });

  //----------------------------------------------------------------------------

  const server = new rxCouch();
    // Outside an 'it' scope since we reuse this through the rest of the file.

  it('should return a server object', function () {

    expect(server).to.be.an('object');

  });

  //----------------------------------------------------------------------------

  describe('.allDatabases()', function () {

    it('should return an Observable which yields a list of databases', function (done) {

      const dbsResult = server.allDatabases();

      expectOneResult(dbsResult, done,
        (databases) => {
          expect(databases).to.be.an('array');
          databases.forEach((dbName) => {
            expect(dbName).to.be.a('string');
          });
          expect(databases).to.include('_users');
        });

    });

  });

});
