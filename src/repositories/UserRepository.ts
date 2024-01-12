import { IUserRepository } from "@/contracts/repositories/IUserRepository"
import { IResponse } from "@/contracts/usecases/IResponse"
import { Response } from "../utils/Response"
import { OperationStatus } from "../constants/operations"
import UserEntity from "../entities/UserEntity"
import UserGroupEntity from "../entities/UserGroup"
import { UserRoles } from "../contracts/middleware/AuthGuard"
import { format } from "date-fns"

class UserRepository implements IUserRepository {
    date = new Date()
    formattedTime = format(this.date, "yyyy-MM-dd HH:mm:ss")

    async findByEmail(email: string): Promise<IResponse> {
        try {
            const user = await UserEntity.findOne({ where: { email: email } })
            if (user == null) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("User not found")
                    .setData(undefined)
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(user)
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

    async findByEmailNoPassword(email: string): Promise<IResponse> {
        try {
            const user = await UserEntity.findOne({ where: { email: email } })
            if (user == null) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("User not found")
                    .setData(undefined)
            }
            user?.setDataValue("password", null)

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(user)
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

  async addUserGroup(userId: number, edgeServerId: number, roleId: UserRoles): Promise<IResponse> {

    try {
      const userGroup = await UserGroupEntity.create({
        user_id: userId,
        edge_server_id: edgeServerId,
        role_id: roleId
      })

      return new Response()
        .setStatus(true)
        .setStatusCode(OperationStatus.success)
        .setMessage("ok")
        .setData(userGroup.dataValues)

    } catch (error: any) {
      return new Response()
        .setStatus(false)
        .setStatusCode(OperationStatus.repoError)
        .setMessage(error.message)
    }
  }

  
  async store(
        username: string,
        email: string,
        password: string,
        code: string,
        fcmRegistrationToken: string
    ): Promise<IResponse> {
        try {
            const user = await UserEntity.create({
                username: username,
                email: email,
                password: password,
                is_verified: 0,
                verification_code: code,
                fcm_registration_token:fcmRegistrationToken,
                created_at: this.formattedTime,
            })

            user.setDataValue("password", null)
            // user.setDataValue('verification_code',null)

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(user)
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

    async findByVerificationCode(
        email: String,
        code: String
    ): Promise<IResponse> {
        try {
            const user = await UserEntity.findOne({
                where: { email: email, verification_code: code },
            })

            if (user == null) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("User not found")
                    .setData(null)
            }

            user.setDataValue("password", null)
            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(user)
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

    async updateVerificationStatus(
        email: String,
        status: boolean
    ): Promise<IResponse> {
        try {
            const updateUser = await UserEntity.update(
                {
                    is_verified: status,
                    verification_code: null,
                    updated_at: this.formattedTime,
                },
                { where: { email: email } }
            )

            if (updateUser[0] === 0) {
                throw new Error("Update Gagal, Email tidak valid")
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(updateUser)
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

    async fetchUserByGroup(
        userId: number,
        edgeServerId: number
    ): Promise<IResponse> {
        try {
            const userGroupData = await UserGroupEntity.findOne({
                where: {
                    user_id: userId,
                    edge_server_id: edgeServerId,
                    // role_id: UserRoles.Admin
                },
            })

            const users = await UserEntity.findAll({
                include: {
                    model: UserGroupEntity,
                    attributes: ["user_id", "role_id", "edge_server_id"],
                    where: {
                        edge_server_id:
                            userGroupData?.dataValues.edge_server_id,
                    },
                },
            })

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData({
                    users: users,
                    userGroupId: userGroupData?.getDataValue("id"),
                })
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }

    async getUserGroupStatus(
        userId: number,
        edgeServerId: number
    ): Promise<IResponse> {
        try {
            const userGroupData = await UserGroupEntity.findOne({
                where: {
                    user_id: userId,
                    edge_server_id: edgeServerId,
                },
            })

            if (userGroupData == null) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("model not found")
                    .setData(null)
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(userGroupData.dataValues)
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }

    async storeResetToken(
        email: string,
        resetToken: string
    ): Promise<IResponse> {
        try {
            const updateUser = await UserEntity.update(
                { reset_token: resetToken, updated_at: this.formattedTime },
                { where: { email: email } }
            )

            if (updateUser[0] === 0) {
                throw new Error("Update Gagal, Email tidak valid")
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData("")
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

    async updatePassword(
        password: string,
        resetToken: string
    ): Promise<IResponse> {
        try {
            const userData = await UserEntity.findOne({
                where: { reset_token: resetToken },
            })

            if (userData == null) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("token invalid")
            }

            const updateUser = await UserEntity.update(
                {
                    password: password,
                    reset_token: null,
                    updated_at: this.formattedTime,
                },
                { where: { email: userData?.getDataValue("email") } }
            )

            if (updateUser[0] === 0) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoError)
                    .setMessage("update gagal")
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(true)
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
        }
    }

    async updateProfile(email: string, avatarUrl: string): Promise<IResponse> {
        try {
            const updateUser = await UserEntity.update(
                { avatar: avatarUrl, updated_at: this.formattedTime },
                { where: { email: email } }
            )

            if (updateUser[0] === 0) {
                return new Response()
                    .setStatus(true)
                    .setStatusCode(OperationStatus.unauthorizedAccess)
                    .setMessage("Update Gagal, User Unauthorized")
                    .setData(null)
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(updateUser)
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

    async findById(id: number): Promise<IResponse> {
        try {
            const user = await UserEntity.findOne({ where: { id: id } })
            if (user == null) {
                return new Response()
                    .setStatus(false)
                    .setStatusCode(OperationStatus.repoErrorModelNotFound)
                    .setMessage("User not found")
                    .setData(undefined)
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(user)
        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }

    async updateFcmRegistrationToken(email: string, fcmRegistrationToken: string): Promise<IResponse>{
        try {
            const updateUser = await UserEntity.update(
                { fcm_registration_token: fcmRegistrationToken, updated_at: this.formattedTime },
                { where: { email: email } }
            )

            console.log("updateUser",updateUser)

            if (updateUser[0] === 0) {
                return new Response()
                    .setStatus(true)
                    .setStatusCode(OperationStatus.unauthorizedAccess)
                    .setMessage("Update Gagal, User Unauthorized")
                    .setData(null)
            }

            return new Response()
                .setStatus(true)
                .setStatusCode(OperationStatus.success)
                .setMessage("ok")
                .setData(null)

        } catch (error: any) {
            return new Response()
                .setStatus(false)
                .setStatusCode(OperationStatus.repoError)
                .setMessage(error)
                .setData({})
        }
    }
}

export { UserRepository }
