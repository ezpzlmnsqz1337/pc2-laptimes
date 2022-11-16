import EditableSelect from '@/components/ui/EditableSelect.vue'
import { config, shallowMount } from '@vue/test-utils'
import vSelect from 'vue-select'

describe('EditableSelect.vue', () => {
  config.global.stubs = {
    'v-select': vSelect
  }

  config.global.mocks = {
    isLocal: () => true
  }

  it('should display text and icon from the props', () => {
    const text = 'TestText1'
    const icon = 'test-icon'

    const wrapper = shallowMount(EditableSelect, {
      props: { text, icon }
    })

    const textContainer = wrapper.get('.__textContainer')
    const iconDiv = wrapper.get('.fa')

    expect(textContainer.text()).toContain(text)
    expect(iconDiv.classes()).toContain(`fa-${icon}`)
  })

  it('should be editable if editable prop is true', () => {
    const editable = true
    const wrapper = shallowMount(EditableSelect, {
      props: { editable }
    })

    wrapper.vm.startEditing({ ctrlKey: true } as any)

    expect(wrapper.vm.edit).toBe(true)
  })

  it('should not be editable if editable prop is false', () => {
    const editable = false
    const wrapper = shallowMount(EditableSelect, {
      props: { editable }
    })

    wrapper.vm.startEditing({ ctrlKey: true } as any)

    expect(wrapper.vm.edit).toBe(false)
  })

  it('should display v-select when edit is true', () => {
    const text = 'TestText1'

    const wrapper = shallowMount(EditableSelect, {
      props: { text }
    })

    const textContainer = wrapper.get('.__textContainer')

    expect(textContainer.text()).toContain(text)
  })
})
