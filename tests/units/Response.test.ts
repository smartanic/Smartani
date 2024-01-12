import assert from 'assert'
import { Response} from '../../src/utils/Response'

describe('test response', () => {
    let response = new Response()

    response.setStatus(true)
    response.setStatusCode(-1)
    response.setMessage("wkwk")
    response.setData("")

    it('positive', function() {
        assert.ok(response.getStatus())
        assert.equal(-1, response.getStatusCode())
        assert.equal("wkwk", response.getMessage())
        assert.equal("", response.getData())
    })

    it('negative', function() {
        assert.notEqual(false, response.getStatus())
        assert.notEqual(1, response.getStatusCode())
        assert.notEqual("wk", response.getMessage())
        assert.notEqual("1", response.getData())
        assert.equal(false, response.isFailed())

        response.setStatus(false)

        assert.ok(response.isFailed())
    })
})
