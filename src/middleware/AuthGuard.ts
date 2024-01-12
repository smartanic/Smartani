import { IAuthGuard, UserRoles } from "@/contracts/middleware/AuthGuard"

export class AuthGuard implements IAuthGuard {
    private userId?: number
    private userEmail?: string
    private username?: string
    private userRole?: UserRoles
    private edgeServerId: number

    constructor(
        userId: number,
        userEmail: string,
        username: string,
        userRole: UserRoles,
        edgeServerId: number = 0
    ) {
        this.userId = userId
        this.userEmail = userEmail
        this.username = username
        this.userRole = userRole
        this.edgeServerId = edgeServerId
    }

    getUserId(): number {
        return this.userId!
    }

    getUserEmail(): string {
        return this.userEmail!
    }

    getUsername(): string {
        return this.username!
    }

    getUserRole(): UserRoles {
        return this.userRole!
    }

    getEdgeServerId(): number {
        return this.edgeServerId!
    }
}

