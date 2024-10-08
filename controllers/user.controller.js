import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        req.flash('error', 'Something went wrong while generating referesh and access token');
        return res.redirect('/login');
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, mobile, dob, password } = req.body;

    if (
        [fullName, email, mobile, dob, password].some((field) => field?.trim() === "")
    ) {
        req.flash('error', 'All fields are required');
        return res.redirect('/register');
        throw new ApiError(400, "All fields are required")
    }
    
    if(mobile.length != 10){
        req.flash('error', 'Invalid Moile Number');
        return res.redirect('/register');
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { mobile }]
    })

    if (existedUser) {
        req.flash('error', 'User with email or mobile no. already exists');
        return res.redirect('/register');
        throw new ApiError(409, "User with email or mobile no. already exists")
    }
    //console.log(req.files);

    // const avatarLocalPath = req.files?.avatar[0]?.path;

    // if (!avatarLocalPath) {
    //     throw new ApiError(400, "Avatar file is required")
    // }

    // const avatar = await uploadOnCloudinary(avatarLocalPath)

    // if (!avatar) {
    //     throw new ApiError(400, "Avatar file is required")
    // }


    const user = await User.create({
        fullName,
        email,
        password,
        mobile,
        dob,
        isAdmin: false
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        req.flash('error', 'Something went wrong while registering the user');
        return res.redirect('/register');
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .redirect("/")
    // return res.status(201).json(
    //     new ApiResponse(200, createdUser, "User registered Successfully")
    // )
    // return res.redirc('index');

})

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { email, password } = req.body
    
    if (!email || !password) {
        req.flash('error', 'Email and Password is required');
        return res.redirect('/login')
        throw new ApiError(400, "email is required")
    }

    const user = await User.findOne({
        $or: [{ email }]
    })
    
    if (!user) {
        req.flash('error', 'User does not exist');
        return res.redirect('/login');
        throw new ApiError(404, "User does not exist")
    }
    console.log(email);

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        req.flash('error', 'Invalid user credentials');
        return res.redirect('/login');
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .redirect("/")
    // .json(
    //     new ApiResponse(
    //         200, 
    //         {
    //             user: loggedInUser, accessToken, refreshToken
    //         },
    //         "User logged In Successfully"
    //     )
    // )

})

const logoutUser = asyncHandler(async (req, res) => {
    if(!req.user._id){
        return res
        .status(200)
        .redirect('/login')
    }
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .redirect('/login')
    // return res
    //     .status(200)
    //     .clearCookie("accessToken", options)
    //     .clearCookie("refreshToken", options)
    //     .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body



    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }

    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar image updated successfully")
        )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
}