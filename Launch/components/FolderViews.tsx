import {
  Button,
  Color,
  ColorPicker,
  ContentUnavailableView,
  EditButton,
  ForEach,
  Form,
  GeometryReader,
  HStack,
  Image,
  LazyVGrid,
  List,
  Navigation,
  NavigationLink,
  Picker,
  RoundedRectangle,
  Section,
  Spacer,
  Stepper,
  Text,
  TextField,
  Toggle,
  VStack,
  ZStack,
  useEffect,
  useObservable,
  useState
} from 'scripting'
import {
  AppItem,
  Config,
  DEFAULT_CONFIG,
  Folder,
  FolderStyle
} from '../constants'
import { AppIconArtwork } from './AppIconArtwork'
import { AppEditor } from './AppEditor'
import {
  AppIconView,
  AppRow,
  FolderIconView,
  filterApps
} from './SharedViews'

export const FOLDER_PREVIEW_RADIUS = 22
const FOLDER_LABEL_HORIZONTAL_INSET = 10

export function FolderNameEditor({
  folder,
  onSave
}: {
  folder?: Folder
  onSave: (name: string, icon?: string, color?: string) => void
}) {
  const [name, setName] = useState(folder?.name ?? '')
  const [icon, setIcon] = useState(folder?.icon ?? '')
  const [color, setColor] = useState<Color>(
    (folder?.color ?? '#007AFF') as Color
  )
  const dismiss = Navigation.useDismiss()

  return (
    <Form
      navigationTitle={folder ? '重命名文件夹' : '新建文件夹'}
      toolbar={{
        confirmationAction: [
          <Button
            key="save"
            title="保存"
            systemImage="checkmark"
            disabled={!name.trim()}
            action={() => {
              if (name.trim()) {
                onSave(
                  name.trim(),
                  icon.trim() || undefined,
                  color as unknown as string
                )
                dismiss()
              }
            }}
          />
        ]
      }}
    >
      <Section>
        <TextField title="文件夹名称" value={name} onChanged={setName} />
      </Section>
      <Section
        header={<Text>外观</Text>}
        footer={<Text>图标留空时使用默认文件夹样式。</Text>}
      >
        <HStack>
          <Text>图标 (SF Symbol)</Text>
          <TextField
            title="图标"
            prompt="可选"
            value={icon}
            onChanged={setIcon}
          />
          <FolderIconView icon={icon} color={color as unknown as string} />
        </HStack>
        <ColorPicker value={color} onChanged={setColor}>
          <Text>文件夹颜色</Text>
        </ColorPicker>
      </Section>
    </Form>
  )
}

function AddExistingAppView({
  apps,
  onAdd
}: {
  apps: AppItem[]
  onAdd: (items: AppItem[]) => void
}) {
  const dismiss = Navigation.useDismiss()
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState('')

  function toggle(id: string) {
    setSelected(prev => {
      const next = { ...prev }
      if (next[id]) {
        delete next[id]
      } else {
        next[id] = true
      }
      return next
    })
  }

  const selectedItems = apps.filter(app => selected[app.id])
  const visible = filterApps(apps, query)

  return (
    <List
      navigationTitle="添加应用"
      searchable={{
        value: query,
        onChanged: setQuery,
        prompt: '搜索应用'
      }}
      overlay={
        visible.length === 0 ? (
          <ContentUnavailableView
            title="无结果"
            systemImage="magnifyingglass"
          />
        ) : undefined
      }
      toolbar={{
        topBarTrailing: [
          <Button
            key="add"
            title={
              selectedItems.length > 0
                ? `添加 (${selectedItems.length})`
                : '添加'
            }
            action={() => {
              if (selectedItems.length === 0) return
              onAdd(selectedItems)
              dismiss()
            }}
          />
        ]
      }}
    >
      <Section
        footer={<Text>选择一个或多个应用添加到此文件夹。</Text>}
      >
        {visible.map(item => {
          const isSelected = !!selected[item.id]
          return (
            <Button
              key={item.id}
              action={() => toggle(item.id)}
              buttonStyle="plain"
            >
              <HStack>
                <AppIconView
                  icon={item.icon}
                  iconDark={item.iconDark}
                  iconType={item.iconType}
                  color={item.color}
                />
                <Text font={16}>{item.name}</Text>
                <Spacer />
                <Image
                  systemName={
                    isSelected ? 'checkmark.circle.fill' : 'circle'
                  }
                  foregroundStyle={
                    (isSelected ? 'systemBlue' : 'systemGray') as Color
                  }
                />
              </HStack>
            </Button>
          )
        })}
      </Section>
    </List>
  )
}

function FolderSettingsView({
  folder,
  onUpdateFolderStyle
}: {
  folder: Folder
  onUpdateFolderStyle: (id: string, style: FolderStyle | undefined) => void
}) {
  const [customize, setCustomize] = useState(
    !!folder.style && Object.keys(folder.style).length > 0
  )
  const [folderStyle, setFolderStyle] = useState<FolderStyle>(
    folder.style ?? {}
  )

  function updateStyle(patch: Partial<FolderStyle>) {
    const next = { ...folderStyle, ...patch }
    setFolderStyle(next)
    onUpdateFolderStyle(folder.id, Object.keys(next).length > 0 ? next : undefined)
  }

  function setCustomized(value: boolean) {
    setCustomize(value)
    if (value) {
      setFolderStyle(folder.style ?? {})
    } else {
      onUpdateFolderStyle(folder.id, undefined)
    }
  }

  return (
    <Form navigationTitle="文件夹设置">
      <Section>
        <Toggle
          title="自定义此文件夹"
          value={customize}
          onChanged={setCustomized}
        />
      </Section>
      {customize && (
        <Section header={<Text>外观</Text>}>
          <Stepper
            onIncrement={() => {
              const value =
                (folderStyle.iconSize ?? DEFAULT_CONFIG.iconSize) + 1
              if (value <= 100) updateStyle({ iconSize: value })
            }}
            onDecrement={() => {
              const value =
                (folderStyle.iconSize ?? DEFAULT_CONFIG.iconSize) - 1
              if (value >= 20) updateStyle({ iconSize: value })
            }}
          >
            <HStack>
              <Text>图标大小</Text>
              <Spacer />
              <Text opacity={0.5}>
                {(folderStyle.iconSize ?? DEFAULT_CONFIG.iconSize).toString()}
              </Text>
            </HStack>
          </Stepper>
          <Picker
            title="图标形状"
            value={folderStyle.shape ?? DEFAULT_CONFIG.shape}
            onChanged={(value: string) =>
              updateStyle({ shape: value as 'rounded' | 'circle' })
            }
          >
            <Text tag="rounded">圆角矩形</Text>
            <Text tag="circle">圆形</Text>
          </Picker>
          {(folderStyle.shape ?? DEFAULT_CONFIG.shape) === 'rounded' && (
            <Stepper
              onIncrement={() => {
                const base =
                  folderStyle.cornerRadius ?? DEFAULT_CONFIG.iconSize * 0.225
                const value = base + 1
                if (value <= 50) updateStyle({ cornerRadius: value })
              }}
              onDecrement={() => {
                const base =
                  folderStyle.cornerRadius ?? DEFAULT_CONFIG.iconSize * 0.225
                const value = base - 1
                if (value >= 0) updateStyle({ cornerRadius: value })
              }}
            >
              <HStack>
                <Text>圆角半径</Text>
                <Spacer />
                <Text opacity={0.5}>
                  {Math.round(
                    folderStyle.cornerRadius ??
                      DEFAULT_CONFIG.iconSize * 0.225
                  ).toString()}
                </Text>
              </HStack>
            </Stepper>
          )}
          <Stepper
            onIncrement={() => {
              const value =
                (folderStyle.spacing ?? DEFAULT_CONFIG.spacing) + 1
              if (value <= 50) updateStyle({ spacing: value })
            }}
            onDecrement={() => {
              const value =
                (folderStyle.spacing ?? DEFAULT_CONFIG.spacing) - 1
              if (value >= 0) updateStyle({ spacing: value })
            }}
          >
            <HStack>
              <Text>间距</Text>
              <Spacer />
              <Text opacity={0.5}>
                {(folderStyle.spacing ?? DEFAULT_CONFIG.spacing).toString()}
              </Text>
            </HStack>
          </Stepper>
          <Picker
            title="图标渲染模式"
            value={
              folderStyle.widgetAccentedRenderingMode ??
              DEFAULT_CONFIG.widgetAccentedRenderingMode
            }
            onChanged={(value: string) =>
              updateStyle({
                widgetAccentedRenderingMode:
                  value as Config['widgetAccentedRenderingMode']
              })
            }
          >
            <Text tag="fullColor">全彩</Text>
            <Text tag="accented">着色</Text>
            <Text tag="desaturated">去色</Text>
            <Text tag="accentedDesaturated">着色并去色</Text>
          </Picker>
        </Section>
      )}
      {customize && (
        <Section>
          <Button
            title="恢复全局设置"
            role="destructive"
            action={() => {
              setCustomize(false)
              setFolderStyle({})
              onUpdateFolderStyle(folder.id, undefined)
            }}
          />
        </Section>
      )}
    </Form>
  )
}

export function FolderDetail({
  folder,
  apps,
  folders,
  onUpdateApp,
  onSyncFolderApps,
  onRenameFolder,
  onUpdateFolderStyle
}: {
  folder: Folder
  apps: Observable<AppItem[]>
  folders: Folder[]
  onUpdateApp: (item: AppItem) => void
  onSyncFolderApps: (folderId: string, items: AppItem[]) => void
  onRenameFolder: (id: string, name: string, icon?: string, color?: string) => void
  onUpdateFolderStyle: (id: string, style: FolderStyle | undefined) => void
}) {
  const [allApps, setAllApps] = useState<AppItem[]>(() => apps.value)

  useEffect(() => {
    const onAppsChanged = (value: AppItem[]) => setAllApps(value)
    apps.subscribe(onAppsChanged)
    return () => apps.unsubscribe(onAppsChanged)
  }, [])

  const folderApps = useObservable<AppItem[]>(() =>
    apps.value.filter(app => app.folderIds?.includes(folder.id))
  )
  const otherApps = allApps.filter(
    app => !app.folderIds?.includes(folder.id)
  )

  useEffect(() => {
    onSyncFolderApps(folder.id, folderApps.value)
  }, [folderApps.value])

  useEffect(() => {
    const next = allApps.filter(app => app.folderIds?.includes(folder.id))
    const current = folderApps.value
    if (
      next.length === current.length &&
      next.every((app, index) => app === current[index])
    ) {
      return
    }
    folderApps.setValue(next)
  }, [allApps])

  function addToFolder(items: AppItem[]) {
    items.forEach(item =>
      onUpdateApp({
        ...item,
        folderIds: item.folderIds?.includes(folder.id)
          ? item.folderIds
          : [...(item.folderIds ?? []), folder.id]
      })
    )
    folderApps.setValue(
      apps.value.filter(app => app.folderIds?.includes(folder.id))
    )
  }

  return (
    <List
      navigationTitle={folder.name}
      toolbar={{
        topBarTrailing: [
          <EditButton key="edit" />,
          <NavigationLink
            key="rename"
            destination={
              <FolderNameEditor
                folder={folder}
                onSave={(name, icon, color) =>
                  onRenameFolder(folder.id, name, icon, color)
                }
              />
            }
          >
            <Image systemName="pencil" />
          </NavigationLink>,
          <NavigationLink
            key="settings"
            destination={
              <FolderSettingsView
                folder={folder}
                onUpdateFolderStyle={onUpdateFolderStyle}
              />
            }
          >
            <Image systemName="gearshape" />
          </NavigationLink>
        ]
      }}
    >
      <Section>
        <ForEach
          data={folderApps}
          editActions="all"
          builder={item => (
            <NavigationLink
              key={item.id}
              destination={
                <AppEditor item={item} folders={folders} onSave={onUpdateApp} />
              }
            >
              <AppRow item={item} />
            </NavigationLink>
          )}
        />
        <NavigationLink
          destination={
            <AppEditor
              folders={folders}
              initialFolderIds={[folder.id]}
              onSave={item => addToFolder([item])}
            />
          }
        >
          <HStack>
            <Image
              systemName="plus.circle.fill"
              foregroundStyle={'systemGreen' as Color}
            />
            <Text>添加新应用</Text>
          </HStack>
        </NavigationLink>
      </Section>
      {otherApps.length > 0 && (
        <Section>
          <NavigationLink
            destination={
              <AddExistingAppView apps={otherApps} onAdd={addToFolder} />
            }
          >
            <HStack>
              <Image
                systemName="plus.square.on.square"
                foregroundStyle={'systemBlue' as Color}
              />
              <Text>添加已有应用</Text>
            </HStack>
          </NavigationLink>
        </Section>
      )}
    </List>
  )
}

function resolveFolderConfig(folder: Folder, globalConfig: Config): Config {
  const style = folder.style
  return {
    ...globalConfig,
    iconSize: style?.iconSize ?? globalConfig.iconSize,
    shape: style?.shape ?? globalConfig.shape,
    cornerRadius: style?.cornerRadius ?? globalConfig.cornerRadius,
    spacing: style?.spacing ?? globalConfig.spacing,
    widgetAccentedRenderingMode:
      style?.widgetAccentedRenderingMode ??
      globalConfig.widgetAccentedRenderingMode
  }
}

export function FolderGridCell({
  folder,
  apps,
  globalConfig,
  supportsLiquidGlass
}: {
  folder: Folder
  apps: AppItem[]
  globalConfig: Config
  supportsLiquidGlass: boolean
}) {
  const config = resolveFolderConfig(folder, globalConfig)

  return (
    <VStack
      alignment="center"
      spacing={8}
      frame={{ maxWidth: 'infinity', alignment: 'top' }}
      contentShape={{ type: 'rect', cornerRadius: FOLDER_PREVIEW_RADIUS }}
    >
      <FolderPreview
        folder={folder}
        apps={apps}
        config={config}
        supportsLiquidGlass={supportsLiquidGlass}
      />
      <HStack
        spacing={6}
        padding={{ horizontal: FOLDER_LABEL_HORIZONTAL_INSET }}
        frame={{ maxWidth: 'infinity' }}
      >
        <Text
          font={14}
          fontWeight="semibold"
          foregroundStyle={'label' as Color}
          lineLimit={1}
        >
          {folder.name}
        </Text>
        <Spacer />
        <Text font={12} foregroundStyle={'secondaryLabel' as Color}>
          {apps.length.toString()}
        </Text>
      </HStack>
    </VStack>
  )
}

function FolderPreview({
  folder,
  apps,
  config,
  supportsLiquidGlass
}: {
  folder: Folder
  apps: AppItem[]
  config: Config
  supportsLiquidGlass: boolean
}) {
  return (
    <ZStack
      frame={{ maxWidth: 'infinity' }}
      background={
        supportsLiquidGlass
          ? undefined
          : {
              style: 'ultraThinMaterial',
              shape: { type: 'rect', cornerRadius: FOLDER_PREVIEW_RADIUS }
            }
      }
      glassEffect={
        supportsLiquidGlass
          ? {
              glass: UIGlass.regular(),
              shape: { type: 'rect', cornerRadius: FOLDER_PREVIEW_RADIUS }
            }
          : undefined
      }
      clipShape={{ type: 'rect', cornerRadius: FOLDER_PREVIEW_RADIUS }}
      overlay={
        supportsLiquidGlass ? undefined : (
          <RoundedRectangle
            cornerRadius={FOLDER_PREVIEW_RADIUS}
            stroke={{
              shapeStyle: 'separator' as Color,
              strokeStyle: { lineWidth: 0.5 }
            }}
          />
        )
      }
    >
      <RoundedRectangle
        cornerRadius={FOLDER_PREVIEW_RADIUS}
        fill={'clear' as Color}
        aspectRatio={{ value: 1, contentMode: 'fit' }}
        frame={{ maxWidth: 'infinity' }}
        overlay={
          apps.length === 0 ? (
            <VStack opacity={0.45} spacing={6}>
              <FolderIconView icon={folder.icon} color={folder.color} />
              <Text font={11} foregroundStyle={'secondaryLabel' as Color}>
                空文件夹
              </Text>
            </VStack>
          ) : apps.length === 1 ? (
            <AppIconArtwork item={apps[0]} config={config} />
          ) : (
            <GeometryReader>
              {proxy => (
                <FolderPreviewGrid
                  apps={apps}
                  config={config}
                  previewSize={Math.min(proxy.size.width, proxy.size.height)}
                />
              )}
            </GeometryReader>
          )
        }
      />
    </ZStack>
  )
}

function FolderPreviewGrid({
  apps,
  config,
  previewSize
}: {
  apps: AppItem[]
  config: Config
  previewSize: number
}) {
  const iconSize = config.iconSize || DEFAULT_CONFIG.iconSize
  const preferredSpacing = config.spacing
  const availableSize = Math.max(0, previewSize - preferredSpacing * 2)
  const itemStride = iconSize + preferredSpacing
  const columns = Math.max(
    1,
    Math.floor((availableSize + preferredSpacing) / itemStride)
  )
  const rowCount = columns
  const displayApps = apps.slice(0, columns * rowCount)
  const iconColumns = [
    {
      size: {
        type: 'adaptive' as const,
        min: iconSize,
        max: iconSize
      },
      spacing: preferredSpacing
    }
  ]

  return (
    <VStack
      padding={preferredSpacing}
      frame={{ width: previewSize, height: previewSize }}
    >
      <Spacer />
      <LazyVGrid
        columns={iconColumns}
        alignment="center"
        spacing={preferredSpacing}
        frame={{ maxWidth: 'infinity' }}
      >
        {displayApps.map(item => (
          <AppIconArtwork key={item.id} item={item} config={config} />
        ))}
      </LazyVGrid>
      <Spacer />
    </VStack>
  )
}
