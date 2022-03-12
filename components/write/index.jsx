import { useAuthContext } from 'context'
import { Button, Formfield, RenderErrors } from 'elements'
import Image from 'next/image'
import { FormProvider, useForm } from 'react-hook-form'
import { comment, isError } from 'utils'
import { avatars } from 'utils'
import s from './styles.module.scss'
import cn from 'classnames'
import Link from 'next/link'
import { AiFillLock } from 'react-icons/ai'
import { usePatch, usePost } from 'hooks'
import { CREATE_COMMENT, REPLY_COMMENT } from 'services'

export const Write = ({ updateThread, isReply, commentId, to }) => {
  const methods = useForm()
  const { avatar } = useAuthContext()
  const { token } = useAuthContext()
  const { postRequest, postLoading, postErrors } = usePost()
  const { patchRequest, patchLoading, patchErrors } = usePatch()

  console.log(isReply)

  const handleData = data => {
    methods.reset()
    console.log(data)
    updateThread(data.comment)
  }

  if (!token) {
    return (
      <p className={s.auth}>
        <AiFillLock />
        <span>
          In order to write a comment, you must
          <Link href="/login">Login</Link>|<Link href="/signup">SignUp</Link>
        </span>
      </p>
    )
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(data => {
          isReply
            ? patchRequest(
                REPLY_COMMENT(commentId),
                { ...data, parent: commentId },
                handleData,
              )
            : postRequest(CREATE_COMMENT, data, handleData)
        })}
        className={s.form}
      >
        <p className="sr-only">
          {isReply ? `reply to ${to}` : 'use textbox to write a new comment'}
        </p>
        <Formfield
          {...comment}
          label={isReply ? 'Reply' : 'add a comment'}
          styles={s.textarea}
          multiline
        />
        <RenderErrors errors={postErrors} />
        <RenderErrors errors={patchErrors} />

        <div className={s.actions}>
          <div className={s.profile}>
            <Image
              src={avatars[avatar ? avatar : 0].source}
              placeholder="blur"
              quality={100}
              alt={`your avatar picture is ${avatars[avatar ? avatar : 0].alt}`}
              className={cn(s.img)}
            />
          </div>
          <Button
            disabled={
              isError(methods.formState.errors) || postLoading || patchLoading
            }
            loading={postLoading || patchLoading}
          >
            {isReply ? 'reply' : 'send'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
