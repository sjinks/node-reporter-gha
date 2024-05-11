# node-reporter-gha

[![Build and Test](https://github.com/sjinks/mocha-reporter-gha/actions/workflows/build.yml/badge.svg)](https://github.com/sjinks/mocha-reporter-gha/actions/workflows/build.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=sjinks_node-reporter-gha&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=sjinks_node-reporter-gha)

A GitHub Actions test reporter for the Node.js [Test Runner](https://nodejs.org/api/test.html).

## Installation

```bash
npm i -D node-reporter-gha
```

## Usage

```bash
node --test --test-reporter=node-reporter-gha
```

Multiple reporters:

```bash
node --test --test-reporter=spec --test-reporter-destination=stdout --test-reporter=node-reporter-gha --test-reporter-destination=stdout
```

See [Test reporters](https://nodejs.org/api/test.html#test-reporters) for details.
