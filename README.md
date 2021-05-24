# sACN Module

A simplified module to send sACN

## Usage

### Instantiation

    let sacn = new sACNSocket(options);

### Options

universes: An Array of integers which describe universe numbers, 1-65535

priorities: An Array of integers which describe priority, 1-200

interface: auto = automatic assignment, or supply a standard nodejs interface object

### Events

#### 'ready'

Emitted when the socket is connected and ready

#### 'data'

Will emit raw messages from the multicast group

## To-Do

- Bind socket to appropriate multicast groups
- Parse incoming sACN packets
- Look at other events for other data situations, alternate start codes, etc
