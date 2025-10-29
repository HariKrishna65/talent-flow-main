/* eslint-disable */
/* tslint:disable */

/**
 * Mock Service Worker (2.4.12).
 * @see https://github.com/mswjs/msw
 * - Please do NOT modify this file.
 * - Please do NOT serve this file on production.
 */

const INTEGRITY_CHECKSUM = '223d48bb460b94caa1eaf6431167c67d'
const IS_MOCKED_RESPONSE = Symbol('isMockedResponse')
const activeClientIds = new Set()

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', async function (event) {
  const clientId = event.source.id

  if (!clientId || !event.data) {
    return
  }

  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  switch (event.data) {
    case 'KEEPALIVE_REQUEST': {
      sendToClient(clientId, {
        type: 'KEEPALIVE_RESPONSE',
      })
      break
    }

    case 'INTEGRITY_CHECK_REQUEST': {
      sendToClient(clientId, {
        type: 'INTEGRITY_CHECK_RESPONSE',
        payload: INTEGRITY_CHECKSUM,
      })
      break
    }

    case 'MOCK_ACTIVATE': {
      activeClientIds.add(clientId)

      sendToClient(clientId, {
        type: 'MOCKING_ENABLED',
        payload: true,
      })
      break
    }

    case 'MOCK_DEACTIVATE': {
      activeClientIds.delete(clientId)
      break
    }

    case 'CLIENT_CLOSED': {
      activeClientIds.delete(clientId)

      const remainingClients = allClients.filter((client) => {
        return client.id !== clientId
      })

      if (remainingClients.length === 0) {
        self.registration.unregister()
      }

      break
    }
  }
})

self.addEventListener('fetch', function (event) {
  const { request } = event

  if (request.mode === 'navigate') {
    return
  }

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return
  }

  if (activeClientIds.size === 0) {
    return
  }

  const requestId = crypto.randomUUID()

  event.respondWith(
    handleRequest(event, requestId).catch((error) => {
      console.error(
        '[MSW] Failed to mock a "%s" request to "%s": %s',
        request.method,
        request.url,
        error,
      )
    }),
  )
})

async function handleRequest(event, requestId) {
  const client = await event.target.clients.get(event.clientId)

  if (!client) {
    return passthrough(event.request)
  }

  const requestClone = event.request.clone()
  const getOriginalResponse = () => passthrough(event.request)

  self.dispatchEvent(
    new FetchEvent('fetch', {
      request: event.request,
      clientId: event.clientId,
    }),
  )

  const requestBuffer = await requestClone.arrayBuffer()
  const clientMessage = await sendToClient(
    client.id,
    {
      type: 'REQUEST',
      payload: {
        id: requestId,
        url: requestClone.url,
        method: requestClone.method,
        headers: Object.fromEntries(requestClone.headers.entries()),
        cache: requestClone.cache,
        mode: requestClone.mode,
        credentials: requestClone.credentials,
        destination: requestClone.destination,
        integrity: requestClone.integrity,
        redirect: requestClone.redirect,
        referrer: requestClone.referrer,
        referrerPolicy: requestClone.referrerPolicy,
        body: requestBuffer,
        keepalive: requestClone.keepalive,
      },
    },
    [requestBuffer],
  )

  switch (clientMessage.type) {
    case 'MOCK_RESPONSE': {
      return respondWithMock(clientMessage.data)
    }

    case 'PASSTHROUGH': {
      return getOriginalResponse()
    }
  }

  return getOriginalResponse()
}

function sendToClient(clientId, message, transferrables = []) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = (event) => {
      if (event.data && event.data.error) {
        return reject(event.data.error)
      }

      resolve(event.data)
    }

    self.clients
      .get(clientId)
      .then((client) => {
        if (!client) {
          return reject(new Error(`Failed to get client by id "${clientId}"`))
        }

        client.postMessage(message, [channel.port2, ...transferrables])
      })
      .catch(reject)
  })
}

async function respondWithMock(responseJson) {
  const response = new Response(
    responseJson.body,
    responseJson,
  )

  Reflect.defineProperty(response, IS_MOCKED_RESPONSE, {
    value: true,
    enumerable: true,
  })

  return response
}

async function passthrough(request) {
  const response = await fetch(request)

  return response
}

function sendToClient(clientId, message, transferrables = []) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = (event) => {
      if (event.data && event.data.error) {
        return reject(event.data.error)
      }

      resolve(event.data)
    }

    self.clients
      .get(clientId)
      .then((client) => {
        if (!client) {
          return reject(new Error(`Failed to get client by id "${clientId}"`))
        }

        client.postMessage(message, [channel.port2, ...transferrables])
      })
      .catch(reject)
  })
}
