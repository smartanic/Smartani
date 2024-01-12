import assert from "assert"
import { IAuthGuard, UserRoles } from "../../src/contracts/middleware/AuthGuard"
import { AuthGuard } from "../../src/middleware/AuthGuard"


describe('Auth Guard', () => {
    
    it('positive', () => {

        let authGuard: IAuthGuard = new AuthGuard(1000, "iyan@gmail.com", "iyan123", UserRoles.Admin, 20)

        assert.equal(authGuard.getUserId(), 1000)
        assert.equal(authGuard.getUserEmail(), "iyan@gmail.com")
        assert.equal(authGuard.getUsername(), "iyan123")
        assert.equal(authGuard.getUserRole(), UserRoles.Admin)
        assert.equal(authGuard.getEdgeServerId(), 20)
    })
})
